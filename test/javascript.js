"use strict";
/*global describe, it, assert*/

describe("javascript", function () {

    describe("gpf.js.keywords", function () {

        it("gives the list of JavaScript keywords", function () {
            assert(gpf.js.keywords() instanceof Array);
            assert("string" === typeof gpf.js.keywords()[0]);
        });

    });

});
