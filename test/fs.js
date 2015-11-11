"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("fs", function () {

    if (gpf.internals) {

        function notImplemented (path, eventsHandler) {
            gpf.events.fire(gpf.events.EVENT_ERROR, {
                error: gpf.error.notImplemented()
            }, eventsHandler);
            return path; // so that it is used
        }

        function getFromPath (path) {
            var parts = path.split("/"),
                item = testFolder,
                filePath,
                fileName;
            if (parts.shift() !== "test") {
                return undefined;
            }
            filePath = "test";
            while (0 < parts.length) {
                fileName = parts[0];
                if ("object" === item[fileName]) {
                    parts.shift();
                    item = item[fileName];
                    filePath = filePath + "/" + fileName;
                    if (undefined === item._fileInfo) {
                        item._fileInfo = {
                            fileName: fileName,
                            filePath = filePath,
                            createdDateTime: new Date(),
                            modifiedDateTime: new Date()
                        };
                        if (file._size) {
                            delete file._size;
                            fileInfo.type = gpf.fs.TYPE_FILE;
                            fileInfo.size = file._size;
                        } else {
                            fileInfo.type = gpf.fs.TYPE_FOLDER;
                            fileInfo.size = 0;
                        }
                    }
                } else {
                    return undefined;
                }
            }
            return item;
        }

        var testFolder = {
                data: {
                    "file.bin": {
                        _size: 256
                    }
                }
            },

            testStorage = {

                getInfo: function (path, eventsHandler) {
                    var file = getFromPath(path),
                        fileInfo;
                    if (undefined === file) {
                        fileInfo = {
                            type: gpf.fs.TYPE_NOT_FOUND
                        };
                    }  else {
                        fileInfo = file._fileInfo;
                    }
                    gpf.events.fire(gpf.events.EVENT_READY, {fileInfo: fileInfo}, eventsHandler);
                },

                readAsBinaryStream: notImplemented,
                writeAsBinaryStream: notImplemented,
                close: notImplemented,

                explore: function (path, eventsHandler) {

                },

                createFolder: notImplemented,
                deleteFile: notImplemented,
                deleteFolder: notImplemented

            };

        describe("(internal)", function () {

            describe("_gpfFsExploreEnumerator", function () {

                var _gpfFsExploreEnumerator = gpf.internals._gpfFsExploreEnumerator;

                it("exists");

            });

            describe("_gpfFsExploreEnumerator", function () {

                var _gpfFsBuildFindMethod = gpf.internals._gpfFsBuildFindMethod;

                it("exists");

            });

        });

    }

    if (null === gpf.fs.host()) {
        return; // No host
    }

    describe("Data generator", function () {

        it("file.bin", function (done) {
            var fs = gpf.fs.host();
            fs.getInfo("test/data/file.bin", function (infoEvent) {
                if (infoEvent.type === gpf.events.EVENT_READY && infoEvent.get("info").type === gpf.fs.TYPE_FILE) {
                    done(); // Already exists
                    return;
                }
                // File does not exist, generates
                var count = 0,
                    wStream;
                function loop (event) {
                    assert(!event || gpf.events.EVENT_READY === event.type);
                    if (256 === count) {
                        fs.close(wStream, function () {});
                        done();
                    }
                    wStream.write([count++], loop);
                }
                // Current path is always root of gpf-js
                fs.writeAsBinaryStream("test/data/file.bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    wStream = event.get("stream");
                    loop();
                });
            });
        });

    });

    describe("gpf.fs.host", function () {

        var gpfI = gpf.interfaces,
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

        describe("getInfo", function () {

            function checkInfo (info) {
                assert(null !== info);
                assert("object" === typeof info);
                assert("number" === typeof info.type);
                assert("string" === typeof info.fileName);
                assert("string" === typeof info.filePath);
                assert("number" === typeof info.size);
                assert("object" === typeof info.createdDateTime);
                assert("object" === typeof info.modifiedDateTime);
            }

            it("tells if a file exists", function (done) {
                iFs.getInfo("src/fs.js", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    checkInfo(info);
                    assert(info.type === gpf.fs.TYPE_FILE);
                    assert(info.size > 0);
                    done();
                });
            });

            it("tells if a directory exists", function (done) {
                iFs.getInfo("src", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    checkInfo(info);
                    assert(info.type === gpf.fs.TYPE_DIRECTORY);
                    // size is not relevant
                    done();
                });
            });

            it("tells if a path does not exists", function (done) {
                iFs.getInfo("null", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    assert(null !== info);
                    assert("object" === typeof info);
                    assert(info.type === gpf.fs.TYPE_NOT_FOUND);
                    done();
                });
            });

        });

        function _close (stream) {
            iFs.close(stream, function () {}); // ignore
        }

        describe("readAsBinaryStream", function () {

            it("reads binary files", function (done) {
                iFs.readAsBinaryStream("test/data/file.bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var rStream = event.get("stream");
                    rStream.read(1, function (readEvent) {
                        assert(gpf.events.EVENT_DATA === readEvent.type);
                        var buffer = readEvent.get("buffer");
                        assert(1 === buffer.length);
                        assert(0 === buffer[0]);
                        _close(rStream);
                        done();
                    });
                });
            });

        });

        describe("writeAsBinaryStream", function () {

            it("writes binary files", function (done) {
                iFs.writeAsBinaryStream("tmp/test/fs_" + gpf.host() + ".bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var wStream = event.get("stream");
                    wStream.write([0, 34, 75, 0, 128, 255], function (writeEvent) {
                        assert(gpf.events.EVENT_READY === writeEvent.type);
                        _close(wStream);
                        done();
                    });
                });
            });

        });

        describe("explore", function () {

            it("fails on a file", function (done) {
                iFs.explore("src/fs.js", function (event) {
                    assert(gpf.events.EVENT_ERROR === event.type);
                    done();
                });
            });

            it("gets an IEnumerator on a folder", function (done) {
                iFs.explore("src", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var enumerator = event.get("enumerator");
                    assert(null !== enumerator);
                    assert(gpf.interfaces.isImplementedBy(enumerator, gpf.interfaces.IEnumerator));
                    done();
                });
            });

        });

    });

});
