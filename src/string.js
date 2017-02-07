/**
 * @file String helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfI*/ // gpf.interfaces
/*global _gpfStreamPipe*/ // gpf.stream.pipe
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfStringStream*/ // IReadableStream & IWritableStream for string
/*#endif*/

//region String Array helpers

/**
 * Count how many strings must be concatenated to fit the requested size.
 * If the last string has too many characters, it is ignored and remaining will tell how many characters are left.
 *
 * @param {String[]} strings String array
 * @param {Number} size Number of characters to compute
 * @returns {Object} containing
 * - {Number} count Number of parts to get to fit the size
 * - {Number} remaining Number of characters not fitting
 */
function _gpfStringArrayCountToFit (strings, size) {
    var count = 0;
    strings.every(function (string) {
        var length = string.length;
        if (length <= size) {
            ++count;
            size -= length;
            return true;
        }
        return false;
    });
    return {
        count: count,
        remaining: size
    };
}

function _gpfStringsSafeSplice (strings, itemsCount) {
    if (0 < itemsCount) {
        return strings.splice(0, itemsCount);
    }
    return [];
}

/**
 * Splice the string array on the number of items and, if specified, takes characters on the next item.
 * Returns the concatenated string
 *
 * @param {String[]} strings String array
 * @param {Number} itemsCount Number of it
 * @param {Number} characterCount
 * @return {String}
 */
function _gpfStringArraySplice (strings, itemsCount, characterCount) {
    var result,
        string;
    _gpfAssert(itemsCount <= strings.length, "itemsCount within strings range");
    result = _gpfStringsSafeSplice(strings, itemsCount);
    if (strings.length && characterCount) {
        // Last item has to be cut, remove first item
        string = strings.shift();
        // Add the missing characters
        result.push(string.substr(0, characterCount));
        // Put back the remaining characters
        strings.unshift(string.substr(characterCount));
    }
    return result.join("");
}

/**
 * Extract the first characters of a string array
 *
 * @param {Strings[]} strings This array is modified after extraction
 * @param {Number} size Number of characters to get
 * @return {String}
 */
function _gpfStringArrayExtract (strings, size) {
    var parts = _gpfStringArrayCountToFit(strings, size);
    return _gpfStringArraySplice(strings, parts.count, parts.remaining);
}

//endregion

var
    /**
     * Implements IReadableStream & IWritableStream on top of a string (FIFO read / write)
     *
     * @class StringStream
     * @extends Object
     * @implements gpf.interfaces.IReadableStream, gpf.interfaces.IWritableStream
     */
    _GpfStringStream = _gpfDefine("StringStream", {
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream), gpf.$InterfaceImplement(_gpfI.IWritableStream)],
        "+": {

            // @param {String} [string=undefined] string
            constructor: function (string) {
                if ("string" === typeof string) {
                    this._buffer = [string];
                } else {
                    this._buffer = [];
                }
            },

            //region gpf.interfaces.IReadableStream

            // @inheritdoc gpf.interfaces.IReadableStream#read
            read: function (count, eventsHandler) {
                var result;
                if (0 === this._buffer.length) {
                    _gpfEventsFire.call(this, _GPF_EVENT_END_OF_DATA, {}, eventsHandler);
                } else {
                    result = _gpfStringArrayExtract(this._buffer, count);
                    _gpfEventsFire.call(this, _GPF_EVENT_DATA, {buffer: result}, eventsHandler);
                }
            },

            //endregion

            //region gpf.interfaces.IReadableStream

            // @inheritdoc gpf.interfaces.IWritableStream#read
            write: function (buffer, eventsHandler) {
                _gpfAssert("string" === typeof buffer && buffer.length, "String buffer must contain data");
                this._buffer.push(buffer);
                _gpfEventsFire.call(this, _GPF_EVENT_READY, {}, eventsHandler);
            },

            //endregion

            /**
             * Consolidate the result string
             * @return {String}
             */
            toString: function () {
                return this._buffer.join("");
            }

        },
        "-": {

            // @property {String[]} buffer
            _buffer: []

        }
    });

Object.assign(gpf, {

    /** sameas _gpfStringCapitalize */
    capitalize: _gpfStringCapitalize,

    /** sameas _gpfStringReplaceEx */
    replaceEx: _gpfStringReplaceEx,

    /** sameas _gpfStringEscapeFor */
    escapeFor: _gpfStringEscapeFor,

    /**
     * Extract the first characters of a string array
     *
     * @param {Strings[]} strings This array is modified after extraction
     * @param {Number} [size=0] size Number of characters to get, all if 0
     * @return {String}
     */
    stringExtractFromStringArray: _gpfStringArrayExtract,

    /**
     * Converts the string into a stream
     *
     * @param {String} that String to convert
     * @return {Object} Implementing gpf.interfaces.IReadableStream & gpf.interfaces.IWritableStream
     */
    stringToStream: function (that) {
        return new _GpfStringStream(that);
    },

    /**
     * Converts the stream into a string
     *
     * @param {gpf.interfaces.IReadableStream} stream
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * finished reading the stream, the buffer is provided
     *
     * @eventParam {String} buffer
     */
    stringFromStream: function (stream, eventsHandler) {
        if (stream instanceof _GpfStringStream) {
            _gpfEventsFire(_GPF_EVENT_READY, {buffer: stream.toString()}, eventsHandler);
        } else {
            var stringStream = new _GpfStringStream();
            _gpfStreamPipe({
                readable: stream,
                writable: stringStream
            }, function (event) {
                if (_GPF_EVENT_READY === event.type) {
                    _gpfEventsFire(_GPF_EVENT_READY, {buffer: stringStream.toString()}, eventsHandler);
                } else {
                    _gpfEventsFire(event, {}, eventsHandler);
                }
            });
        }
    }

});

/*#ifndef(UMD)*/

gpf.internals._gpfStringArrayCountToFit = _gpfStringArrayCountToFit;
gpf.internals._gpfStringArraySplice = _gpfStringArraySplice;
gpf.internals._gpfStringArrayExtract = _gpfStringArrayExtract;

/*#endif*/
