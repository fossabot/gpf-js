"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs", function () {

    if ("browser" === gpf.host()) {
        return; // Nothing done yet
    }

    describe("gpf.fs.host", function () {

        var
            gpfI = gpf.interfaces,
            iFs;

        beforeEach(function () {
            iFs = gpf.fs.host();
        });

        it("gives access to a IFileStorage interface", function () {
            assert(null !== iFs);
            if (null !== iFs) {
                assert(gpfI.isImplementedBy(iFs, gpfI.IFileStorage));
            }
        });

    });

    //describe("data", function () {
    //
    //    it("generates file.bin", function (done) {
    //        var fs = gpf.fs.host(),
    //            count = 0,
    //            wStream;
    //        function loop(event) {
    //            assert(!event || gpf.events.EVENT_READY === event.type);
    //            if (256 === count) {
    //                fs.close(wStream);
    //                done();
    //            }
    //            wStream.write([count++], loop);
    //        }
    //        // Current path is always root of gpf-js
    //        fs.writeAsBinaryStream("test/data/file.bin",
    //            function (event) {
    //                assert(gpf.events.EVENT_READY === event.type);
    //                wStream = event.get("stream");
    //                loop();
    //            }
    //        );
    //    });
    //
    //});

});
