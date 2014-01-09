(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
        _b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        + "0123456789+/",
        _b16 = "0123456789ABCDEF",
        _toBaseANY = function (base, value, length, safepad) {
            var
                baseLength = base.length,
                result = [],
                digit;
            while (0 < value) {
                digit = value % baseLength;
                result.unshift(base.charAt(digit));
                value = (value - digit) / baseLength;
            }
            if (undefined !== length) {
                if (undefined === safepad) {
                    safepad = base.charAt(0);
                }
                while (result.length < length) {
                    result.unshift(safepad.charAt(result.length
                        % safepad.length));
                }
            } else if (0 === result.length) {
                result = [base.charAt(0)]; // 0
            }
            return result.join("");
        },
        _fromBaseANY = function (base, text, safepad) {
            var
                baseLength = base.length,
                result = 0,
                idx = 0;
            if (undefined === safepad) {
                safepad = base.charAt(0);
            }
            while (idx < text.length) {
                if (-1 === safepad.indexOf(text.charAt(idx))) {
                    break;
                } else {
                    ++idx;
                }
            }
            while (idx < text.length) {
                result = baseLength * result + base.indexOf(text.charAt(idx++));
            }
            return result;
        };

    gpf.bin = {

        /*
         * Encodes the value within the specified base.
         * Result string length can be defined and missing characters will be
         * added with safepad.
         * 
         * @param {string} base values
         * @param {number} value to encode
         * @param {number} length
         * @param {string} safepad [safepad=base.charAt(0)]
         * @returns {string}
         */
        toBaseANY: _toBaseANY,

        /*
         * Decodes the text value using the specified base.
         * @param {string} base
         * @param {string} text
         * @param {string} safepad [safepad=""]
         * @returns {number}
         */
        fromBaseANY: _fromBaseANY,

        /*
         * Returns the hexadecimal encoding of value.
         * @param {number} value
         * @param {number} length
         * @param {string} safepad [safepad="0"]
         * @returns {string}
         */
        toHexa: function (value, length, safepad) {
            return _toBaseANY(_b16, value, length, safepad);
        },

        /*
         * Decodes the hexadecimal text value.
         * @param {string} text
         * @param {string} safepad [safepad="0"]
         * @returns {Number}
         */
        fromHexa: function (text, safepad) {
            return _fromBaseANY(_b16, text, safepad);
        },

        /*
         * Returns the base 64 encoding of value.
         * @param {number} value
         * @param {number} length
         * @param {string} safepad [safepad="0"]
         * @returns {string}
         */
        toBase64: function (value, length, safepad) {
            return _toBaseANY(_b64, value, length, safepad);
        },

        /*
         * Decodes the hexadecimal text value.
         * @param {string} text
         * @param {string} safepad [safepad="0"]
         * @returns {Number}
         */
        fromBase64: function (text, safepad) {
            return _fromBaseANY(_b64, text, safepad);
        }

    };

}()); /* End of privacy scope */
