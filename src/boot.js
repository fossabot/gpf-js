/*#ifndef(UMD)*/
"use strict";
/*global gpfSourcesPath:true*/ // Global source path
/*exported _GPF_HOST_BROWSER*/
/*exported _GPF_HOST_NODEJS*/
/*exported _GPF_HOST_PHANTOMJS*/
/*exported _GPF_HOST_RHINO*/
/*exported _GPF_HOST_UNKNOWN*/
/*exported _GPF_HOST_WSCRIPT*/
/*exported _gpfContext*/
/*exported _gpfDosPath*/
/*exported _gpfEmptyFunc*/
/*exported _gpfExit*/
/*exported _gpfHost*/
/*exported _gpfIgnore*/
/*exported _gpfInBrowser*/
/*exported _gpfInNode*/
/*exported _gpfMainContext*/
/*exported _gpfMsFSO*/
/*exported _gpfNodeFs*/
/*exported _gpfNodePath*/
/*exported _gpfResolveScope*/
/*exported _gpfVersion*/
/*exported _gpfWebDocument*/
/*exported _gpfWebHead*/
/*exported _gpfWebWindow*/
/*#endif*/

/*global phantom:true*/
/*jshint browser: true*/
/*jshint node: true*/
/*jshint rhino: true*/
/*jshint wsh: true*/
/*global WScript*/

var
    // GPF version
    _gpfVersion = "0.1",

    // Host type constants
    _GPF_HOST_BROWSER               = "browser",
    _GPF_HOST_NODEJS                = "nodejs",
    _GPF_HOST_PHANTOMJS             = "phantomjs",
    _GPF_HOST_RHINO                 = "rhino",
    _GPF_HOST_UNKNOWN               = "unknown",
    _GPF_HOST_WSCRIPT               = "wscript",

    // Host type, see _GPF_HOST_xxx
    _gpfHost = _GPF_HOST_UNKNOWN,

    // Indicates that paths are DOS-like (i.e. case insensitive with /)
    _gpfDosPath = false,

    /*jshint -W040*/ // This is the common way to get the global context
    // Main context object
    _gpfMainContext = this,
    /*jshint +W040*/

    /**
     * To implement gpf.noConflict(), we need to keep the previous content of gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {undefined|Object}
     */
    _gpfConflictingSymbol,

    // An empty function
    _gpfEmptyFunc = function () {},

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     */
    /*gpf:nop*/ _gpfIgnore = _gpfEmptyFunc,

    /**
     * Exit function
     *
     * @param {Number} code
     */
    _gpfExit = _gpfEmptyFunc,

    /**
     * Translate the parameter into a valid scope
     *
     * @param {*} scope
     */
    _gpfResolveScope = function (scope) {
        if (null === scope || "object" !== typeof scope) {
            return _gpfMainContext;
        }
        return scope;
    },

    // The current host is a nodeJS like
    _gpfInNode = false,

    // The current host is a browser like
    _gpfInBrowser = false,

    /**
     * Browser window object
     *
     * @type {Object}
     */
    _gpfWebWindow,

    /**
     * Browser document object
     *
     * @type {Object}
     */
     _gpfWebDocument,

    /**
     * Browser head tag
     *
     * @type {Object}
     */
    _gpfWebHead,

    /**
     * Scripting.FileSystemObject activeX
     *
     * @type {Object}
     */
    _gpfMsFSO,

    /**
     * Node require("fs")
     *
     * @type {Object}
     */
    _gpfNodeFs,

    /**
     * Node require("path")
     *
     * @type {Object}
     */
    _gpfNodePath;

/*#ifdef(DEBUG)*/

_gpfVersion += "d";

/*#endif*/

/*#ifndef(UMD)*/

var // Asynchronous load function
    _gpfAsyncLoadForBoot,
   // Synchronous load function
    _gpfSyncLoadForBoot;

/*#endif*/

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    _gpfHost = _GPF_HOST_WSCRIPT;
    _gpfDosPath = true;
    _gpfMainContext = (function () {
        return this;
    }).apply(null, []);
    _gpfExit = function (code) {
        WScript.Quit(code);
    };

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {
            WScript.Echo("    " + t);
        },
        info: function (t) {
            WScript.Echo("[?] " + t);
        },
        warn: function (t) {
            WScript.Echo("/!\\ " + t);
        },
        error: function (t) {
            WScript.Echo("(X) " + t);
        }
    };

/*#ifndef(UMD)*/

    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");

    _gpfSyncLoadForBoot = function (srcFileName) {
        // Use Scripting.FileSystem Object to read the file
        var srcFile = _gpfMsFSO.OpenTextFile(srcFileName),
            srcContent;
        srcContent = srcFile.ReadAll();
        srcFile.Close();
        /*jslint evil: true*/
        eval(srcContent);
        /*jslint evil: false*/
    };

/*#endif*/

} else if ("undefined" !== typeof print && "undefined" !== typeof java) {
    _gpfHost = _GPF_HOST_RHINO;
    _gpfDosPath = false;
    _gpfMainContext = (function () {return this;}).apply(null, []);
    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {print("    " + t);},
        info: function (t) {print("[?] " + t);},
        warn: function (t) {print("/!\\ " + t);},
        error: function (t) {print("(X) " + t);}
    };

/*#ifndef(UMD)*/

    _gpfSyncLoadForBoot = load;

/*#endif*/

// PhantomJS
} else if ("undefined" !== typeof phantom && phantom.version) {
    _gpfHost = _GPF_HOST_PHANTOMJS;
    _gpfDosPath = require("fs").separator === "\\";
    _gpfMainContext = window;
    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = phantom.exit;

/*#ifndef(UMD)*/

    _gpfNodeFs =  require("fs");

    _gpfSyncLoadForBoot = function (srcFileName) {
        /*jslint evil: true*/
        eval(_gpfNodeFs.read(srcFileName));
        /*jslint evil: false*/
    };

/*#endif*/

// Nodejs
} else if ("undefined" !== typeof module && module.exports) {
    _gpfHost = _GPF_HOST_NODEJS;
    _gpfNodePath = require("path");
    _gpfDosPath = _gpfNodePath.sep === "\\";
    _gpfMainContext = global;
    _gpfInNode = true;
    _gpfExit = process.exit;

/*#ifndef(UMD)*/

    _gpfNodeFs =  require("fs");

    _gpfSyncLoadForBoot = function (srcFileName) {
        /*jslint evil: true*/
        eval(_gpfNodeFs.readFileSync(srcFileName).toString());
        /*jslint evil: false*/
    };

/*#endif*/

// Browser
} else if ("undefined" !== typeof window) {
    _gpfHost = _GPF_HOST_BROWSER;
    _gpfMainContext = window;
    _gpfInBrowser = true;
    _gpfExit = _gpfEmptyFunc;
    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;

/*#ifndef(UMD)*/

    _gpfAsyncLoadForBoot = function (srcFileName, callback) {
        if (gpf.web.include) {
            gpf.web.include(srcFileName, function (event) {
                if (gpf.events.EVENT_ERROR === event.type) {
                    callback(event.get("error"));
                } else {
                    callback();
                }
            });
            return;
        }
        var script = _gpfWebDocument.createElement("script");
        script.language = "javascript";
        script.src = srcFileName;
        _gpfWebHead.insertBefore(script, _gpfWebHead.firstChild);
        // TODO Need to wait for the module to be loaded...
        var bootList = {
            "sources":          "gpf.sources",
            "compatibility":    "Function.prototype.compatibleName",
            "constants":        "gpf.HOST_UNKNOWN",
            "events":           "gpf.events",
            "include":          "gpf.web.include"
        };
            //if (undefined !== _gpfContext(bootList[idx].split("."))) {
            //    ++idx;
            //}
            //if (idx === bootList.length) {
            //    // Now that all initial sources are loaded, load the rest using gpf.web.include
            //    sources = gpf.sources();
            //    length = sources.length;
            //    idx = sources.indexOf(bootList[bootList.length - 2]) + 1;
            //    loadSources();
            //} else {
            //    // Use an aggressive setting as it will be used only for the non UMD version
            //    setTimeout(boot, 0);
    };

/*#endif*/

}

/*#ifndef(UMD)*/

_gpfMainContext.gpf = {};

/*#else*/

_gpfConflictingSymbol = _gpfMainContext.gpf;

/**
 * Relinquish control of the gpf variable.
 *
 * @return {Object} current GPF instance
 */
gpf.noConflict = function () {
    if (undefined !== _gpfConflictingSymbol) {
        _gpfMainContext.gpf = _gpfConflictingSymbol;
    } else {
        delete _gpfMainContext.gpf;
    }
    return gpf;
};

/*#endif*/

// Install host specifics (if any)
if (_gpfInNode) {
    gpf.node = {};
}
// Some web-related tools will be configured even if not in a browser, declare the namespace now
gpf.web = {};

// Returns the current version
gpf.version = function () {
    return _gpfVersion;
};

/**
 * Returns a string identifying the detected host
 *
 * @return {String}
 * - gpf.HOST_WSCRIPT for cscript and wscript
 * - gpf.HOST_NODEJS for nodejs
 * - gpf.HOST_PHANTOMJS for phantomjs
 * - gpf.HOST_BROWSER for any browser
 * - gpf.HOST_UNKNOWN if not detected
 */
gpf.host = function () {
    return _gpfHost;
};

function _getObjectProperty(parent, name) {
    if (undefined !== parent) {
        return parent[name];
    }
}

function _getOrCreateObjectProperty(parent, name) {
    var result = parent[name];
    if (undefined === result) {
        result = parent[name] = {};
    }
    return result;
}

/**
 * Resolve the provided contextual path and returns the result
 *
 * @param {String[]} path array of identifiers
 * @param {Boolean} [createMissingParts=false] createMissingParts if the path leads to undefined parts and
 * createMissingParts is true, it allocates a default empty object
 *
 * @return {*|undefined}
 * - when path is undefined, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
function _gpfContext (path, createMissingParts) {
    var reducer,
        rootContext;
    if (createMissingParts) {
        reducer = _getOrCreateObjectProperty;
    } else {
        reducer = _getObjectProperty;
    }
    if (path[0] === "gpf") {
        rootContext = gpf;
        path = path.slice(1);
    } else {
        rootContext = _gpfMainContext;
    }
    return path.reduce(reducer, rootContext);
}

/**
 * Resolve the provided contextual path and returns the result
 *
 * @param {String} path Dot separated list of identifiers
 *
 * @return {*|undefined}
 * - when path is undefined, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
gpf.context = function (path) {
    if (undefined === path) {
        return _gpfMainContext;
    }
    return _gpfContext(path.split("."));
};

/*#ifndef(UMD)*/

/*exported _gpfFinishLoading*/ // Will be used by the boot specifics

var
    // Set to true once all sources of GPF are loaded
    _gpfLoaded = false,

    /**
     * List of functions to call on load
     *
     * @type {Function[]}
     */
    _gpfLoadCallbacks = [],

    // Callback used once all sources are loaded, invoke the callbacks
    _gpfFinishLoading = function () {
        _gpfLoaded = true;
        while (_gpfLoadCallbacks.length) {
            _gpfLoadCallbacks.shift()();
        }
    };

/**
 * Test if GPF is loaded
 *
 * @param {Function} [callback=undefined] callback This callback is invoked when GPF is loaded (may be immediately if
 * already loaded)
 * @return {Boolean} True if GPF is fully loaded, false otherwise
 */
gpf.loaded = function (callback) {
    if (callback) {
        if (_gpfLoaded) {
            callback();
        } else {
            _gpfLoadCallbacks.push(callback);
        }
    }
    return _gpfLoaded;
};

if(!gpf.loaded) {

/*#else*/

    gpf.loaded = function (callback) {
        if (callback) {
            callback();
        }
        return true;
    };

/*#endif*/

/*#ifndef(UMD)*/

}

/*#endif*/

/*#ifdef(DEBUG)*/

// DEBUG specifics

/**
 * Assertion helper
 *
 * @param {Boolean} condition May be a truthy value
 * @param {String} message Assertion message (to explain the violation if it fails)
 */
gpf.ASSERT = function (condition, message) {
    if (undefined === message) {
        message = "gpf.ASSERT with no message";
        condition = false;
    }
    if (!condition) {
        console.warn("ASSERTION FAILED: " + message);
        throw gpf.Error.AssertionFailed({
            message: message
        });
    }
};

/**
 * Batch assertion helper
 *
 * @param {Object} messages Dictionary of messages (value being the condition)
 */
gpf.ASSERTS = function (messages) {
    for (var message in messages) {
        if (messages.hasOwnProperty(message)) {
            gpf.ASSERT(messages[message], message);
        }
    }
};

if (!gpf.ASSERT) {

/*#else*/

    /*gpf:nop*/ gpf.ASSERT = _gpfEmptyFunc;
    /*gpf:nop*/ gpf.ASSERTS = _gpfEmptyFunc;

/*#endif*/

/*#ifdef(DEBUG)*/

}

/*#endif*/

/*#ifndef(UMD)*/

/**
 * Loading sources occurs here for the non UMD version.
 * UMD versions (debug / release) will have everything concatenated.
 */

// gpfSourcesPath - if defined - gives the relative path to sources
if ("undefined" === typeof gpfSourcesPath) {
    _gpfMainContext.gpfSourcesPath = "";
} else {
    var pathSep;
    if (_gpfDosPath) {
        pathSep = "\\";
    } else {
        pathSep = "/";
    }
    if (gpfSourcesPath.charAt(gpfSourcesPath.length - 1) !== pathSep) {
        gpfSourcesPath = gpfSourcesPath + pathSep;
    }
}

if (_gpfSyncLoadForBoot) {
    _gpfAsyncLoadForBoot = function (name, callback) {
        _gpfSyncLoadForBoot(name);
        callback();
    };
} else {
    gpf.ASSERT(undefined !== _gpfAsyncLoadForBoot);
}

_gpfAsyncLoadForBoot(gpfSourcesPath + "sources.js", function (err) {
    gpf.ASSERT(undefined === err);
    var sources = gpf.sources(),
        idx = 0;

    function next(err) {
        gpf.ASSERT(undefined === err);
        var src = sources[idx];
        if (!src) {
            _gpfFinishLoading();
        }
        _gpfAsyncLoadForBoot(gpfSourcesPath + src + ".js", next);
    }

    next();
});

/*#endif*/
