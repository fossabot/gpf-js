(function () { /* Begin of privacy scope */
    "use strict";

    if("undefined" === typeof JSON) {
        var
            _obj2json = function (object) {
                var
                    isArray,
                    results,
                    property,
                    value;
                isArray = object instanceof Array;
                results = [];
                /*jshint -W089*/
                for (property in object) {
                    if ("function" === typeof object[property]) {
                        continue; // ignore
                    }
                    value = _json(object[property]);
                    if (isArray) {
                        results.push(value);
                    } else {
                        results.push(property + ": " + value);
                    }
                }
                if (isArray) {
                    return "[" + results.join(", ") + "]";
                } else {
                    return "(" + results.join(", ") + ")";
                }
                /*jshint +W089*/
            },
            _json = function (object) {
                var type = typeof object;
                if ("undefined" === type || "function" === type) {
                    return;
                } else if ("number" === type || "boolean" === type) {
                    return object.toString();
                } else if ("string" === type) {
                    return gpf.escapeFor(object, "jscript");
                }
                if (null === object) {
                    return "null";
                } else {
                    return _obj2json(object);
                }
            };
        gpf.toJSON = _json;
    } else {
        gpf.toJSON = JSON.stringify;
    }

}()); /* End of privacy scope */