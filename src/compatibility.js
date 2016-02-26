/*#ifndef(UMD)*/
"use strict";
/*global _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*global _gpfMainContext*/ // Main context object
/*exported _gpfArraySlice*/ // Slice an array-like object
/*exported _gpfIsISO8601String*/ // Check if the string is an ISO 8601 representation of a date
/*exported _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*#endif*/

/*eslint-disable no-proto*/ // Used for compatibility reasons
/*jshint -W103*/

var _gpfArrayPrototypeSlice = Array.prototype.slice;

/**
 * Slice an array-like object
 *
 * @param {Object} array array-like parameter (arguments, Array)
 * @param {Number} from
 * @param {Number} [to=undefined] to
 * @return {Array}
 */
function _gpfArraySlice (array, from, to) {
    return _gpfArrayPrototypeSlice.apply(array, [from || 0, to || array.length + 1]);
}

function _pad (number) {
    if (10 > number) {
        return "0" + number;
    }
    return number;
}

//region Polyfills for missing 'standard' methods

var _gpfCompatibility = {

    Array: {
        on: Array.prototype,

        // Introduced with JavaScript 1.6
        every: function (callback) {
            var thisArg = arguments[1],
                len = this.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                if (!callback.apply(thisArg, [this[idx], idx, this])) {
                    return false;
                }
            }
            return true;
        },

        // Introduced with JavaScript 1.6
        filter: function (callback) {
            var thisArg = arguments[1],
                result = [],
                len = this.length,
                idx,
                item;
            for (idx = 0; idx < len; ++idx) {
                item = this[idx];
                if (callback.apply(thisArg, [this[idx], idx, this])) {
                    result.push(item);
                }
            }
            return result;
        },

        // Introduced with JavaScript 1.6
        forEach: function (callback) {
            var thisArg = arguments[1],
                len = this.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                callback.apply(thisArg, [this[idx], idx, this]);
            }
        },

        // Introduced with JavaScript 1.5
        indexOf: function (searchElement) {
            var fromIndex = arguments[1],
                index = fromIndex || 0,
                thisLength = this.length;
            while (index < thisLength) {
                if (this[index] === searchElement) {
                    return index;
                }
                ++index;
            }
            return -1;
        },

        // Introduced with JavaScript 1.6
        map: function (callback) {
            var thisArg = arguments[1],
                thisLength = this.length,
                result = new Array(thisLength),
                index;
            for (index = 0; index < thisLength; ++index) {
                result[index] = callback.apply(thisArg, [this[index], index, this]);
            }
            return result;
        },

        // Introduced with JavaScript 1.8
        reduce: function (callback) {
            var initialValue = arguments[1],
                thisLength = this.length,
                index = 0,
                value;
            if (undefined === initialValue) {
                value = this[index++];
            } else {
                value = initialValue;
            }
            for (; index < thisLength; ++index) {
                value = callback(value, this[index], index, this);
            }
            return value;
        }

    },

    Function: {
        on: Function.prototype,

        // Introduced with JavaScript 1.8.5
        bind: function (thisArg) {
            var me = this,
                prependArgs = _gpfArraySlice(arguments, 1);
            return function () {
                var args = _gpfArraySlice(arguments, 0);
                me.apply(thisArg, prependArgs.concat(args));
            };
        }

    },

    Object: {
        on: Object,

        create: (function () {
            function Temp () {}
            return function (O) {
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null;
                /* istanbul ignore if */ // NodeJS does not use __proto__
                if (!obj.__proto__) {
                    obj.__proto__ = O;
                }
                return obj;
            };
        }()),

        getPrototypeOf: function (object) {
            // May break if the constructor has been tampered with
            return object.__proto__ || object.constructor.prototype;
        }

    },

    String: {
        on: String.prototype,

        // Introduced with JavaScript 1.8.1
        trim: (function () {
            var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
            return function () {
                return this.replace(rtrim, "");
            };
        }())

    },

    Date: {
        on: Date.prototype,

        // Introduced with JavaScript 1.8
        toISOString: function () {
            return [
                this.getUTCFullYear(),
                "-",
                _pad(this.getUTCMonth() + 1),
                "-",
                _pad(this.getUTCDate()),
                "T",
                _pad(this.getUTCHours()),
                ":",
                _pad(this.getUTCMinutes()),
                ":",
                _pad(this.getUTCSeconds()),
                ".",
                (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5),
                "Z"
            ].join("");
        }

    }

};

(function () {
    var type,
        compatibleMethods;

    function install (dictionary, methods) {
        for (var name in methods) {
            /* istanbul ignore else */
            if (methods.hasOwnProperty(name)) {
                if (name === "on") {
                    continue;
                }
                /* istanbul ignore if */ // NodeJS environment already contains all methods
                if (undefined === dictionary[name]) {
                    dictionary[name] = methods[name];
                }
            }
        }
    }

    for (type in _gpfCompatibility) {
        /* istanbul ignore else */
        if (_gpfCompatibility.hasOwnProperty(type)) {
            compatibleMethods = _gpfCompatibility[type];
            install(compatibleMethods.on, compatibleMethods);
        }
    }

}());

//endregion

//region Function name

// Get the name of a function if bound to the call
var _gpfJsCommentsRegExp =  new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
function _gpfGetFunctionName () {
    // Use simple parsing
    /*jshint validthis:true*/
    var functionSource = Function.prototype.toString.apply(this), //eslint-disable-line no-invalid-this
        functionKeywordPos = functionSource.indexOf("function"),
        parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
    return functionSource
            .substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9)
            .replace(_gpfJsCommentsRegExp, "") // remove comments
            .trim();
}

// Handling function name properly
/* istanbul ignore if */ // NodeJS exposes Function.prototype.name
if ((function () {
    /* istanbul ignore next */ // Will never be evaluated
    function functionName () {}
    return functionName.name !== "functionName";
})()) {

    Function.prototype.compatibleName = _gpfGetFunctionName;

} else {

    /**
     * Return function name
     *
     * @return {String}
     */
    Function.prototype.compatibleName = function () {
        return this.name;
    };

}

//endregion

//region Date override

var _gpfISO8601RegExp = new RegExp([
    "^([0-9][0-9][0-9][0-9])",
    "\\-",
    "([0-9][0-9])",
    "\\-",
    "([0-9][0-9])",
    "(?:T",
    "([0-9][0-9])",
    "\\:",
    "([0-9][0-9])",
    "\\:",
    "([0-9][0-9])",
    "(?:\\.",
    "([0-9][0-9][0-9])",
    "Z)?)?$"
].join(""));

/**
 * Check if the string is an ISO 8601 representation of a date
 * Supports long and short syntax.
 *
 * @param {String} value
 * @returns {Number[]} 7 numbers composing the date (Month is 0-based)
 */
function _gpfIsISO8601String (value) {
    var matchResult,
        matchedDigits,
        result,
        len,
        idx;
    if ("string" === typeof value) {
        _gpfISO8601RegExp.lastIndex = 0;
        matchResult = _gpfISO8601RegExp.exec(value);
        if (matchResult) {
            result = [];
            len = matchResult.length - 1; // 0 is the recognized string
            for (idx = 0; idx < len; ++idx) {
                matchedDigits = matchResult[idx + 1];
                if (matchedDigits) {
                    result.push(parseInt(matchResult[idx + 1], 10));
                } else {
                    result.push(0);
                }
            }
            // Month must be corrected (0-based)
            --result[1];
            // Some validation
            if (result[1] < 12
                && result[2] < 32
                && result[3] < 24
                && result[4] < 60
                && result[5] < 60) {
                return result;
            }
        }
    }
}

// Backup original Date constructor
var _GpfGenuineDate = _gpfMainContext.Date;

/**
 * Date constructor supporting ISO 8601 format
 *
 * @returns {Date}
 */
function _GpfDate () {
    var firstArgument = arguments[0],
        values = _gpfIsISO8601String(firstArgument);
    if (values) {
        return new _GpfGenuineDate(_GpfGenuineDate.UTC.apply(_GpfGenuineDate.UTC, values));
    }
    return _gpfGenericFactory.apply(_GpfGenuineDate, arguments);
}

// Copy members
[
    "prototype", // Ensure instanceof
    "UTC",
    "parse",
    "now"
].forEach(function (member) {
    _GpfDate[member] = _GpfGenuineDate[member];
});

(function () {
    var supported = false;
    // Test if ISO 8601 format supported
    try {
        var date = new Date("2003-01-22T22:45:34.075Z");
        supported = 2003 === date.getUTCFullYear()
            && 0 === date.getUTCMonth()
            && 0 === date.getUTCMonth()
            && 22 === date.getUTCDate()
            && 22 === date.getUTCHours()
            && 45 === date.getUTCMinutes()
            && 34 === date.getUTCSeconds()
            && 75 === date.getUTCMilliseconds();
    } catch (e) {} //eslint-disable-line no-empty
    /* istanbul ignore if */ // NodeJS environment supports ISO 8601 format
    if (!supported) {
        // Replace constructor with new one
        _gpfMainContext.Date = _GpfDate;
    }

}());

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfArraySlice = _gpfArraySlice;
gpf.internals._gpfCompatibility = _gpfCompatibility;
gpf.internals._gpfGetFunctionName = _gpfGetFunctionName;
gpf.internals._gpfIsISO8601String = _gpfIsISO8601String;
gpf.internals._GpfDate = _GpfDate;

/*#endif*/
