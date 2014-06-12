/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces;

    /**
     * The Readable stream interface is the abstraction for a source of data
     * that you are reading from. In other words, data comes out of a Readable
     * stream.
     *
     * @event data Some data is ready to be ready
     * @eventParam {gpf.IReadOnlyArray} int8buffer Bytes buffer
     *
     * @event close No more data can be read from the stream
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IReadableStream", {

        /**
         * Triggers the reading of data
         *
         * @param {Number} [size=undefined] size Number of bytes to read. Read
         * as much as possible if not specified
         */
        read: function (size) {
            gpf.interfaces.ignoreParameter(size);
        }

    });

    /**
     * The Writable stream interface is an abstraction for a destination that
     * you are writing data to.
     *
     * @event data Some data is ready to be ready
     * @eventParam {gpf.IReadOnlyArray} int8buffer Bytes buffer
     *
     * @event close No more data can be read from the stream
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IWritableStream", {

        /**
         * Triggers the writing of data
         *
         * @param {IReadOnlyArray} buffer Buffer to write
         */
        write: function (buffer) {
            gpf.interfaces.ignoreParameter(buffer);
        }

    });

    /**
     * Text stream
     *
     * @class gpf.interfaces.ITextStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("ITextStream", {

        /**
         * Read characters from the text stream
         *
         * @param {Number} [count=undefined] count Number of chars to read from,
         * read as much as possible if not specified
         * @return {String} null if the end of the stream is reached
         */
        read: function(count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },

        /**
         * Write characters to the text stream.
         * Use null to signal the end of the stream.
         *
         * @arguments Convert all non-null arguments to string and write them
         * to the string
         *
         * TODO create an attribute to signal the use of arguments
         */
        write: function() {
        }

    });

    /**
     * Internal helper to implement the expected write behavior in all streams
     * @inheritDoc gpf.interfaces.ITextStream:write
     */
    gpfI.ITextStream._write = function () {
        var argIdx, arg;
        for (argIdx = 0; argIdx < arguments.length; ++argIdx) {
            arg = arguments[argIdx];
            if (null !== arg && "string" !== typeof arg) {
                arg = arg.toString();
            }
            this.write_(arg);
        }
        if (0 === argIdx) { // No parameter at all
            this.write_(null);
        }
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/