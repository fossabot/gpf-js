"use strict";

describe("base", function () {

    // Global declarations
    var
        string = "Hello World!",
        array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        object = {
            "number": 1,
            "string": string,
            "null": null,
            "object": {member: "value"},
            "function": function () {
                return string;
            }
        };

    describe("gpf.value", function () {

        var date = new Date(2003, 0, 22, 23, 45, 0, 0);

        [
            /* value parameters,                        expected result, message */
            [0, 1, undefined, 0,                        "nothing on numbers"],
            ["0", 1, undefined, 0,                      "number from string"],
            ["0", true, undefined, false,               "boolean from string (false)"],
            ["yes", false, undefined, true,             "boolean from string (true)"],
            [0, true, undefined, false,                 "boolean from number (false)"],
            [1, false, undefined, true,                 "boolean from number (true)"],
            [{}, false, undefined, false,               "boolean from anything else"],
            [undefined, "empty", undefined, "empty",    "nothing and use default value"],
            ["1.2", 1.1, undefined, 1.2,                "string to float"],
            ["1.2", 1, "number", 1.2,                   "string to float as a number"],
            [{}, 1, undefined, 1,                       "number from anything else"],
            [1, "", undefined, "1",                     "string fron number"],
            [1, object, undefined, object,              "object (only default)"],
            [new Date("2013-01-22"), "", undefined, "2013-01-22T00:00:00.000Z",
                                                        "string from date"],
            ["2013-01-22T00:00:00.000Z", new Date(), undefined, new Date("2013-01-22"),
                                                        "date from string"]

        ].forEach(function (parameters) {

            it("converts " + parameters[4], function () {
                var result = gpf.value.apply(null, parameters.slice(0, 3)),
                    expected = parameters[3];
                if ("object" === typeof result && "object" === typeof expected) {
                    // Compare string versions
                    assert(result.toString() === parameters[3].toString());
                } else {
                    assert(result === parameters[3]);
                }
            });

        });

        if (gpf.dateToComparableFormat) {
            it("handles date conversions", function () {
                assert(gpf.like(gpf.value("2003-01-22 23:45:00", date), date));
                assert(gpf.value(date, "") === "2003-01-22 23:45:00");
            });
        } else {
            it("handles date conversions");
        }

    });

    describe("gpf.clone", function () {

        it("creates a shallow clone of an object", function () {
            var clonedObject = gpf.clone(object);
            assert(clonedObject.string === object.string);
            assert(clonedObject.object !== object.object);
            assert(clonedObject.object.member === object.object.member);
            assert(undefined === clonedObject["function"]); // Accepted
        });

    });

    describe("gpf.test", function () {

        it("checks if an item exist in an Array", function () {
            assert(gpf.test(array, 2) === 2);
            assert(gpf.test(array, 11) === undefined);
        });

        it("checks if a member value exist in an Object", function () {
            assert(gpf.test(object, null) === "null");
            assert(gpf.test(object, 1) === "number");
            assert(gpf.test(object, "number") === undefined);
        });

    });

    describe("gpf.set", function () {

        it("does not alter the Array if the value already exists", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 2);
            assert(result === array2);
            assert(result.length === array.length);
            assert(gpf.test(result, 2) !== undefined);
        });

        it("adds the value to the Array", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.set(array2, 11);
            assert(result === array2);
            assert(result.length === array.length + 1);
            assert(gpf.test(result, 11) !== undefined);
        });

    });

    describe("gpf.clear", function () {

        it("does not change the Array if not found", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 11);
            assert(result === array2);
            assert(result.length === array2.length);
            assert(gpf.test(result, 11) === undefined);
        });

        it("removes the value from the Array when found", function () {
            var array2 = array.concat([]), // Clone array
                result = gpf.clear(array2, 2);
            assert(result === array2);
            assert(result.length === array.length - 1);
            assert(gpf.test(result, 2) === undefined);
            assert(result.join("") === "013456789");
        });

        it("does not change the dictionary if not found", function () {
            var object2 = gpf.clone(object),
                result = gpf.clear(object2, 11);
            assert(result === object2);
            assert(undefined === gpf.test(object2, 11));
        });

        it("removes the value from the Array when found", function () {
            var object2 = gpf.clone(object),
                result = gpf.clear(object2, 1);
            assert(result === object2);
            assert(undefined === object2.number);
            assert(undefined === gpf.test(object2, 1));
        });

    });

    describe("gpf.xor", function () {

        it("implements XOR truth table", function () {
            assert(gpf.xor(false, false) === false);
            assert(gpf.xor(false, true) === true);
            assert(gpf.xor(true, false) === true);
            assert(gpf.xor(true, true) === false);
        });

    });

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfStringEscapeFor", function () {

                var _gpfStringEscapeFor = gpf.internals._gpfStringEscapeFor;

                it("escape strings for javascript", function () {
                    assert(_gpfStringEscapeFor("abc", "javascript") === "\"abc\"");
                    assert(_gpfStringEscapeFor("a\r\nb", "javascript") === "\"a\\r\\nb\"");
                    assert(_gpfStringEscapeFor("\"", "javascript") === "\"\\\"\"");
                    assert(_gpfStringEscapeFor("\\", "javascript") === "\"\\\\\"");
                });

                it("escape strings for xml", function () {
                    assert(_gpfStringEscapeFor("<abc>&amp;</abc>", "xml") === "&lt;abc&gt;&amp;amp;&lt;/abc&gt;");
                });

                it("escape strings for html", function () {
                    var htmlResult = "&lt;abc&gt;&aacute;&amp;&egrave;&lt;/abc&gt;";
                    assert(_gpfStringEscapeFor("<abc>\u00E1&\u00E8</abc>", "html") === htmlResult);
                });

            });

            if (gpf.HOST_NODEJS === gpf.host()) {

                describe("_gpfNodeBuffer2JsArray", function () {

                    var _gpfNodeBuffer2JsArray = gpf.internals._gpfNodeBuffer2JsArray;

                    it("converts a NodeJS buffer into an array", function () {
                        var buffer = new Buffer("abc"),
                            intArray = _gpfNodeBuffer2JsArray(buffer);
                        assert(97 === intArray[0]);
                        assert(98 === intArray[1]);
                        assert(99 === intArray[2]);
                    });

                });

            }

        });

    }

});
