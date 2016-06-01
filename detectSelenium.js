"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*eslint-disable no-sync*/

var fs = require("fs"),
    buildWebDriverFor = require("./seleniumDriverFactory.js"),
    browsers = JSON.parse(fs.readFileSync("selenium.json").toString()),
    promises = [];

// Pre-create the tmp folder (it might already exist)
try {
    fs.mkdirSync("tmp"); // May already exist
} catch (e) {} //eslint-disable-line no-empty

function report (browser, status) {
    var message = "\t" + browser + " ";
    message += "........................................".substr(message.length);
    message += " ";
    if (status) {
        console.log(message + "OK");
    } else {
        console.log(message + "KO");
    }
}

function detect (browser) {
    return new Promise(function (resolve /*, reject*/) {

        function fail (reason) {
            report(browser, false);
            if (reason && reason.message) {
                console.warn(reason.message);
            }
            resolve(false);
        }

        try {
            var driver = buildWebDriverFor(browser);
            driver.quit().then(function () {
                report(browser, true);
                resolve(true);
            }, fail);
        } catch (e) {
            console.log(e);
            fail();
        }
    });
}

var browser = process.argv[2];
if (browser) {
    console.log("Testing driver for: " + browser);
    detect(browser).then(function () {
        process.exit(0);
    });

} else {
    console.log("Testing drivers declared in ./selenium.json");

    browsers.forEach(function (browserToDetect) {
        promises.push(detect(browserToDetect));
    });

    Promise.all(promises).then(function (detectedDrivers) {
        console.log("Saving tmp/selenium.json");
        var list = browsers.filter(function (browserToDetect, index) {
            return detectedDrivers[index];
        });
        fs.writeFileSync("./tmp/selenium.json", JSON.stringify(list));
        process.exit(0);
    });
}

