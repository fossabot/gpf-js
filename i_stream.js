/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces;

    /**
     * Text stream
     *
     * @class gpf.interfaces.ITextStream
     * @extends gpf.interfaces.Interface
     */
    gpf.interface("ITextStream", {

        /**
         * Read characters from the text stream
         *
         * @param {number} [count=undefined] count Number of chars to read from,
         * read as much as possible if not specified
         * @return {string} null if the end of the stream is reached
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