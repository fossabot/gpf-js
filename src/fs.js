/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_UNKNOWN*/ // _GPF_FS_TYPE_UNKNOWN
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*#endif*/

gpf.fs = {

    /**
     * Get information on the provided file path
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {Object} info contains:
     * - type {Number} see _GPF_FS_TYPE_xxx
     * - size {Number}
     * - createdDateTime
     * - modifiedDateTime
     */
    getInfo: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Read as a binary stream
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IReadableStream} stream
     */
    readAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Write as a binary stream (overwrite file if it exists)
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IWritableStream} stream
     */
    writeAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Close the underlying file: the stream becomes unusable
     *
     * @param {gpf.interfaces.IReadableStream|
     * gpf.interfaces.IWritableStream} stream
     */
    close: function (stream) {
        _gpfIgnore(stream);
        throw gpf.Error.Abstract();
    },

    /**
     * Find and identify files matching the pattern, trigger a file event
     * when a file is found
     *
     * @param {String} basePath
     * @param {String[]} filters Patterns (see gpf.path.match) of files to
     * detect
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_DATA
     * a matching file has been identified
     * @eventParam {String} path
     *
     * @event gpf.events.EVENT_END_OF_DATA
     */
    find: function (basePath, filters, eventsHandler) {
        var
            pendingCount = 0,
            match = gpf.path.match,
            fs = gpf.fs;
        filters = gpf.path.compileMatchPattern(filters);
        function _done() {
            if (0 === --pendingCount) {
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_END_OF_DATA,
                    {},
                    eventsHandler
                ]);
            }
        }
        function _explore(currentPath) {
            ++pendingCount;
            fs.getInfo(currentPath, function (event) {
                if (_GPF_EVENT_ERROR === event.type) {
                    _gpfEventsFire.apply(null, [
                        event,
                        {},
                        eventsHandler
                    ]);

                } else if (_GPF_FS_TYPE_DIRECTORY === event.type) {
                    ++pendingCount;
/**
 * TODO create an IEnumerator on folder to get all sub elements
                    IEnumerator

                    _fs.readdir(currentPath, function (err, list) {
                        var
                            len,
                            idx;
                        if (err) {
                            console.error(err);
                        } else {
                            len = list.length;
                            for (idx = 0; idx < len; ++idx) {
                                _explore(_path.join(currentPath, list[idx]));
                            }
                        }
                        _done();
                    });
*/

                } else {
                    if (match(filters, currentPath)) {
                        _gpfEventsFire.apply(null, [
                            _GPF_EVENT_DATA,
                            {
                                path: currentPath
                            },
                            eventsHandler
                        ]);
                    }
                }
                _done();

            });
        }
        _explore(basePath);
    }

};

// Create file system constants
(function () {
    var gpfFs = gpf.fs,
        mappings = {
            TYPE_NOT_FOUND: _GPF_FS_TYPE_NOT_FOUND,
            TYPE_FILE: _GPF_FS_TYPE_FILE,
            TYPE_DIRECTORY: _GPF_FS_TYPE_DIRECTORY,
            TYPE_UNKNOWN: _GPF_FS_TYPE_UNKNOWN
        },
        key;
    for (key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            _gpfSetReadOnlyProperty(gpfFs, key, mappings[key]);
        }
    }

}());