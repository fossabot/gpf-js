"use strict";

describe("stream/filter", function () {

    var array = [
        {id: 0, num: 5, str: "e", group: 1, search: "first"},
        {id: 1, num: 1, str: "b", group: 0, search: "second"},
        {id: 2, num: 4, str: "a", group: 1, search: "third"},
        {id: 3, num: 2, str: "d", group: 0, search: "fourth"},
        {id: 4, num: 3, str: "c", group: 1, search: "fifth"}
    ];

    function checkFilteringResult (result, ids) {
        assert(result.length === ids.length);
        assert(result.every(function (item, index) {
            return item.id === ids[index];
        }));
    }

    function test (filterFunc, ids, done) {
        var readable = new gpf.stream.ReadableArray(array),
            filter = new gpf.stream.Filter(filterFunc),
            output = new gpf.stream.WritableArray(array);
        gpf.stream.pipe(readable, filter, output)
            .then(function () {
                checkFilteringResult(output.toArray(), ids);
                done();
            })["catch"](done);
    }

    describe("gpf.stream.Filter", function () {

        it("filters data - no result", function (done) {
            test(function () {
                return false;
            }, [], done);
        });

        it("filters data - one result", function (done) {
            test(function (data) {
                return data.num === 1;
            }, [1], done);
        });

        it("filters data - several results", function (done) {
            test(function (data) {
                return data.group === 1;
            }, [0, 2, 4], done);
        });

    });

});
