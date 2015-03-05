(function () {
    "use strict";
    /*jshint browser: true*/
    /*global gpfSourcesPath, gpfTestsPath*/

    if (!window.gpfSourcesPath) {
        window.gpfSourcesPath = "../../src/";
    }
    if (!window.gpfTestsPath) {
        window.gpfTestsPath = "../";
    }

    var
        loadedCallback,
        sourceIdx = -1,
        sources;

    /**
     * Backward compatibility management
     */
    function _declareTests() {
        console.warn("Test file must be transformed into BDD syntax");
    }

    /**
     * Actively wait for GPF to be loaded
     */
    function _load() {
        // Check if the GPF library is loaded
        if ("undefined" === typeof gpf || !gpf.loaded()) {
            console.log("GPF not loaded yet...");
            window.setTimeout(_load, 100);
            return;
        }

        // Check if sources are loaded
        if (!gpf.sources) {
            console.log("Missing sources");
            gpf.web.include(gpfSourcesPath + "sources.js", {
                load: _load
            });
            return;
        }

        // Load test cases that are named like sources
        if (-1 === sourceIdx) {
            sources = gpf.sources().split(",");
            sourceIdx = 0;
            gpf.declareTests = _declareTests;
        }
        if (sourceIdx < sources.length) {
            var source = sources[sourceIdx];
            if (source) {
                gpf.web.include(gpfTestsPath + source + ".js", {
                    load: _load
                });
                ++sourceIdx;
                return;
            }
        }

        // Everything is loaded
        loadedCallback();
    }

    /**
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     *
     * @param {Function} callback
     */
    window.load = function (callback) {
        loadedCallback = callback;
        var
            locationSearch = window.location.search,
            release = -1 < locationSearch.indexOf("release"),
            debug = -1 < locationSearch.indexOf("debug"),
            head = document.getElementsByTagName("head")[0],
            version,
            script = document.createElement("script");
        if (release) {
            version = "release";
            script.src = gpfSourcesPath + "../build/gpf.js";
        } else if (debug) {
            version = "debug";
            script.src = gpfSourcesPath + "../build/gpf-debug.js";
        } else {
            version = "sources";
            script.src = gpfSourcesPath + "boot.js";
        }
        console.log("Using " + version + " version");
        script.language = "javascript";
        head.insertBefore(script, head.firstChild);
        _load();
    };

}());
