"use strict";

// Custom command lines
module.exports = {
    buildDebug: {
        command: "node make.js debug",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    buildRelease: {
        command: "node make.js release",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    plato: {
        command: "node node_modules\\plato\\bin\\plato -l .jshintrc -t GPF-JS -d tmp\\plato "
                 + configuration.srcFiles.join(" "),
        stdout: true,
        stderr: true
    },
    metrics: {
        command: "node make\\metrics.js",
        stdout: false,
        stderr: true,
        exitCode: 0
    },
    globals: {
        command: "node make\\globals.js",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    version: {
        command: "node make\\version.js",
        stdout: false,
        stderr: false,
        exitCode: 0
    }
};

function _buildTestConfig (name, command) {
    module.exports["test" + name] = {
        command: command,
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Verbose"] = {
        command: command + " -debugger",
        stdout: true,
        stderr: true,
        exitCode: 0
    };
    module.exports["test" + name + "Debug"] = {
        command: command + " -debug",
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Release"] = {
        command: command + " -release",
        stdout: false,
        stderr: false,
        exitCode: 0
    };
}

_buildTestConfig("Node", "node test\\host\\nodejs.js");
_buildTestConfig("Phantom", "node_modules\\grunt-mocha\\node_modules\\grunt-lib-phantomjs\\node_modules\\phantomjs\\"
                            + "lib\\phantom\\phantomjs test\\host\\phantomjs.js");
_buildTestConfig("Wscript", "cscript.exe /D /E:JScript test\\host\\cscript.js");
_buildTestConfig("Rhino", "java -jar node_modules\\rhino-1_7r5-bin\\rhino1_7R5\\js.jar test\\host\\rhino.js");
configuration.selenium.forEach(function (browser) {
    _buildTestConfig(browser.charAt(0).toUpperCase() + browser.substr(1), "node test\\host\\selenium.js " + browser);
});
