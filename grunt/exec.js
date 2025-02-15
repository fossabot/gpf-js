"use strict";

const
    fs = require("fs"),
    tools = require("../res/tools.js"),
    osPathSeparator = require("path").sep,
    isWindows = tools.isWindows,
    toArray = arrayLike => [].slice.call(arrayLike),
    sep = path => osPathSeparator === "/" ? path : path.replace(/\//g, osPathSeparator),

    // Node supports / on any host
    platoCmd = "node node_modules/plato/bin/plato -l .jshintrc -t GPF-JS -d tmp/plato",
    jsdocCmd = "node node_modules/jsdoc/jsdoc -d tmp/jsdoc --verbose -a all -c doc/private.json",
    buildLintingDocCmd = "node doc/linting",
    checkdocCmd = `node doc/validate http://localhost:${configuration.serve.httpPort}/tmp/doc/public/index.html`,

    config = (cmd, ...options) => {
        let objectCmd;
        if (typeof cmd === "string" || typeof cmd === "function") {
            objectCmd = {
                cmd: cmd
            };
        } else {
            objectCmd = cmd;
        }
        return Object.assign.apply(Object, [objectCmd].concat(options));
    },

    silent = {
        stdout: false,
        stderr: false
    },
    showErrors = {
        stdout: false,
        stderr: true
    },
    verbose = {
        stdout: true,
        stderr: true
    },
    failIfNot0 = {
        exitCode: 0
    },

    testConfig = (name, rawCommand, parameters) => {
        let command;
        if (isWindows && rawCommand.includes(" ")) {
            command = `"${rawCommand}"`;
        } else {
            command = rawCommand;
        }
        command += ` ${parameters}`;
        const cmd = suffix => function () {
            let parameter;
            if (arguments.length) {
                parameter = toArray(arguments).join(" ") + " ";
            } else {
                parameter = "";
            }
            return command + " " + parameter + suffix;
        };
        module.exports[`test${name}`] = config(cmd(""), silent, failIfNot0);
        module.exports[`test${name}Verbose`] = config(cmd("-debugger"), verbose, failIfNot0);
        module.exports[`test${name}Coverage`] = config(cmd("-coverage"), verbose, failIfNot0);
        module.exports[`test${name}Debug`] = config(cmd("-debug"), silent, failIfNot0);
        module.exports[`test${name}Release`] = config(cmd("-release"), silent, failIfNot0);
        module.exports[`test${name}Legacy`] = config(version => `${command} legacy/${version}`, silent, failIfNot0);
        module.exports[`test${name}Flavor`] = config(flavor => `${command} flavor:${flavor}`, silent, failIfNot0);
    };

let phantomJsBin = "/usr/local/phantomjs/bin/phantomjs"; // If already installed
if (!fs.existsSync(phantomJsBin)) {
    // Assume it is installed with the phantomjs-prebuilt package
    phantomJsBin = sep("node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs");
}

// Custom command lines
module.exports = {
    buildDebug: config({cmd: "node make.js debug", cwd: "make"}, silent, failIfNot0),
    buildRelease: config({cmd: "node make.js release", cwd: "make"}, silent, failIfNot0),
    plato: config(() => `${platoCmd} ${configuration.files.src.join(" ")}`, verbose),
    metrics: config((...args) => `node make/metrics.js ${args.join(" ")}`, showErrors, failIfNot0),
    globals: config("node make/globals.js", showErrors, failIfNot0),
    version: config("node make/version.js", silent, failIfNot0),
    detectSelenium: config("node test/host/selenium/detect.js", verbose, failIfNot0),
    jsdoc: config((...args) => `${jsdocCmd} ${args.join(" ")}`, verbose, failIfNot0),
    fixUglify: config(name => `node make/fix_uglify.js ${name}`, verbose, failIfNot0),
    buildLintingDoc: config(buildLintingDocCmd, showErrors, failIfNot0),
    checkDoc: config(checkdocCmd, verbose, failIfNot0),
    buildTestIncludes: config({cmd: "node testIncludes", cwd: "make"}, silent, failIfNot0)
};

// Flavor builds
Object.keys(configuration.files.flavors).forEach(flavor => {
    module.exports[`build${tools.capitalize(flavor)}`] = config({
        cmd: `node make.js flavor/${flavor}`,
        cwd: "make"
    }, silent, failIfNot0);
});

// Test configurations
testConfig("Node", "node", "test/host/nodejs.js");
testConfig("Phantom", phantomJsBin, sep("--web-security=false test/host/phantomjs.js"));
if (configuration.host.wscript) {
    testConfig("Wscript", "cscript.exe", `/D /E:JScript ${sep("test/host/cscript.js")}`);
}
testConfig("Nodewscript", "node", "test/host/node_cscript.js");
if (configuration.host.java) {
    testConfig("Rhino", "java", sep("-jar node_modules/rhino-1_7r5-bin/rhino1_7R5/js.jar test/host/java.js"));
}
if (configuration.host.nashorn) {
    testConfig("Nashorn", configuration.host.nashorn, sep("test/host/java.js  --"));
}

Object.keys(configuration.browsers).forEach(browserName =>{
    const
        browserConfig = configuration.browsers[browserName],
        capitalizedBrowserName = tools.capitalize(browserName);
    if (browserConfig.type === "selenium") {
        testConfig(capitalizedBrowserName, "node", `test/host/selenium.js ${browserName}`);
    } else if (browserConfig.type === "spawn") {
        testConfig(capitalizedBrowserName, "node", `test/host/browser.js ${browserName}`);
    }
});
