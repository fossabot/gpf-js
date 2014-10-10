/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    //region Parser

    /**
     * This parser base class maintain the current stream position
     * And also offers some basic features to ease parsing and improve speed
     *
     * The output has to be transmitted through the protected _output function.
     *
     * @class gpf.Parser
     */
    gpf.define("gpf.Parser", {

        public: {

            constructor: function () {
                this.reset();
            },

            /**
             * Resets the parser position & state
             *
             * @param {Function} [state=null] state
             */
            reset: function (state) {
                this._pos = 0;
                this._line = 0;
                this._column = 0;
                this._setParserState(state);
            },

            /**
             * Get current position
             *
             * @return {{pos: number, line: number, column: number}}
             */
            currentPos: function () {
                return {
                    pos: this._pos,
                    line: this._line,
                    column: this._column
                };
            },

            /**
             * Parser entry point
             *
             * @param {...String|null} var_args
             */
            parse : function () {
                var
                    len = arguments.length,
                    idx,
                    arg;
                for (idx = 0; idx < len; ++idx) {
                    arg = arguments[idx];
                    if (null === arg) {
                        this._finalizeParserState();
                    } else {
                        gpf.ASSERT("string" === typeof arg, "string expected");
                        this._parse(arg);
                    }
                }
            },

            /**
             * Defines an handler for the parser output
             *
             * @param {Array|Function|gpf.Callback) handler
             * @private
             */
            setOutputHandler: function (handler) {
                gpf.ASSERT(handler instanceof Array || handler.apply,
                    "Invalid output handler");
                this._outputHandler = handler;
            }

        },

        protected: {

            // Configuration / pre-defined handlers

            /**
             * Initial parser state (set with reset)
             *
             * @type {Function|null}
             * @protected
             */
            _initialParserState: null,

            /**
             * Ignore \r  (i.e. no parsing function called)
             *
             * @type {Boolean}
             * @protected
             */
            _ignoreCarriageReturn: false,

            /**
             * Ignore \n (i.e. no parsing function called)
             *
             * @type {Boolean}
             * @protected
             */
            _ignoreLineFeed: false,

//            /**
//             * Sometimes, common handling of new line can be achieved by a
//             * single function called automatically
//             *
//             * @protected
//             */
//            _parsedEndOfLine: function () {}

            /**
             * No more character will be entered, parser must end
             * Default implementation consists in calling current state with 0
             * as parameter. Can be overridden.
             *
             * @protected
             */
            _finalizeParserState: function () {
                this._pState(0);
            },

            /**
             * Change parser state
             *
             * @param {Function} [state=null] state
             * @protected
             */
            _setParserState: function (state) {
                if (!state) {
                    state = this._initialParserState;
                }
                if (state !== this._pState) {
                    // TODO trigger state transition
                    this._pState = state;
                }
            },

            /**
             * The parser generates an output
             *
             * @param {*} item
             * @protected
             */
            _output: function (item) {
                var handler = this._outputHandler;
                if (handler instanceof Array) {
                    handler.push(item);
                } else if (null !== handler) {
                    // Assuming a Function or a gpf.Callback
                    handler.apply(this, [item]);
                }
            }
        },

        private: {

            /**
             * Absolute parser current position
             *
             * @type {Number}
             * @private
             */
            _pos: 0,

            /**
             * Parser current line
             *
             * @type {Number}
             * @private
             */
            _line: 0,

            /**
             * Parser current column
             *
             * @type {Number}
             * @private
             */
            _column: 0,

            /**
             * Parser current state function
             *
             * @type {Function}
             * @private
             */
            _pState: null,

            /**
             * Output handler
             *
             * @type {Array|Function|gpf.Callback)
             * @private
             */
            _outputHandler: null,

            /**
             * Parser internal entry point
             *
             * @param {String} buffer
             * @private
             */
            _parse : function (buffer) {
                var
                    len,
                    idx,
                    char,
                    state,
                    newLine = false;
                len = buffer.length;
                for (idx = 0; idx < len; ++idx) {
                    char = buffer.charAt(idx);
                    if ("\r" === char && this._ignoreCarriageReturn) {
                        char = 0;
                    }
                    if ("\n" === char && this._ignoreLineFeed) {
                        newLine = true;
                        char = 0;
                    }
                    if (char) {
                        state = this._pState.apply(this, [char]);
                        if (undefined !== state) {
                            this._setParserState(state);
                        }
                    }
                    ++this._pos;
                    if ("\n" === char || newLine) {
                        ++this._line;
                        this._column = 0;
//                        this._parsedEndOfLine();
                    } else {
                        ++this._column;
                    }
                }
            }
        },

        static: {

            /**
             * Use to finalize the parser state
             */
            FINALIZE: null
        }
    });

    //endregion

    //region ParserStream

    /**
     * Encapsulate a parser inside a ReadableStream interface
     *
     * @class gpf.ParserStream
     * @extends gpf.stream.BufferedOnRead
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.ParserStream", gpf.stream.BufferedOnRead, {

        public: {

            /**
             * @param {gpf.Parser} parser
             * @param {gpf.interfaces.IReadableStream} input
             * @constructor
             */
            constructor: function (parser, input) {
                this._super(input);
                this._parser = parser;
                this._parser.setOutputHandler(new gpf.Callback(this._output,
                    this));
            }

        },

        protected: {

            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
             */
            _addToBuffer: function (buffer) {
                this._parser.parse(buffer);
            },

            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_endOfInputStream
             */
            _endOfInputStream: function () {
                this._parser.parse(gpf.Parser.FINALIZE);
            },

            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
             */
            _readFromBuffer:
                gpf.stream.BufferedOnRead.prototype._readFromStringBuffer

        },

        private: {

            /**
             * Callback used to grab the parser output that is concatenated to
             * the buffer
             *
             * @param {String} text
             * @private
             */
            _output: function (text) {
                this._buffer.push(text);
                this._bufferLength += text.length;
            }

        }

    });

    //endregion

    var
        bitTest = gpf.bin.test,
        bitClear = gpf.bin.clear,

    //region ITokenizer

        /**
         * Tokenizer interface
         *
         * @interface gpf.interfaces.ITokenizer
         * @extends gpf.interfaces.Interface
         */
        _ITokenizer = gpf._defIntrf("ITokenizer", {

            /**
             * Submit a character to the tokenizer, result indicates if the
             * token is recognized
             *
             * @param {String} char One character to analyze
             * @return {Number} < 0 means won't recognize
             *                    0 means need more chars
             *                  > 0 means a token is recognized (length result)
             *
             * NOTE: if the result is positive, you may submit more chars and
             * check if it changes.
             */
            write: function (char) {
                gpf.interfaces.ignoreParameter(char);
                return -1;
            }

        }),

    // endregion

    //region Pattern

    /**
     * Pattern structure
     * -----------------
     *
     * [a-zA-Z][a-zA-Z0-9]* is represented by
     *
     * PatternGroup
     * |
     * +- PatternRange
     * |
     * +- PatternRange(max:0)
     *
     *
     * Pattern 'grammar'
     * -----------------
     *
     * pattern
     *      : expression+
     *
     * expression
     *      : item ( '|' item )*
     *
     * item
     *      : match count?
     *
     * count
     *      : '?'
     *      | '*'
     *      | '+'
     *      | '{' <number> '}'
     *
     * match
     *      : '[' char_match_include
     *      | '(' expression ')'
     *      | char
     *
     * char_match_include : '^' char_match_exclude
     *                    | ']'
     *                    | char char_range_sep? char_match_include
     *
     * char_match_exclude : ']'
     *                    | char char_range_sep? char_match_exclude
     *
     * char_range_sep : '-' char
     *
     * char : '\' escaped_char
     *      | <any char but ?*+{[(-[>
     */

        /**
         * Pattern item: an atomic character matching item
         *
         * @class PatternItem
         * @abstract
         * @private
         * @abstract
         */
        PatternItem = gpf.define("PatternItem", {

            private: {

                /**
                 * Min number of item iteration
                 *
                 * @type {Number}
                 * @private
                 */
                "[_min]": [gpf.$ClassProperty(true)],
                _min: 1,

                /**
                 * Maximum number of item iteration
                 * 0 means unlimited
                 *
                 * @type {Number}
                 * @private
                 */
                "[_max]": [gpf.$ClassProperty(true)],
                _max: 1

            },

            public: {

                //region Parsing time

                /**
                 * Parse the character (in the context of the pattern item)
                 *
                 * @param {String} char Character to parse
                 * @return {Number} see PatternItem.PARSE_xxx
                 * @abstract
                 */
                parse: function (char) {
                    gpf.interfaces.ignoreParameter(char);
                    gpf.Error.Abstract();
                    return PatternItem.PARSE_IGNORED;
                },

                /**
                 * finalize the item
                 *
                 * @abstract
                 */
                finalize: function () {
                },

                //endregion

                //region Execution time

                /**
                 * item will be evaluated, reset tokenizer state
                 *
                 * @param {Object} state Free structure to add values to
                 * @abstract
                 */
                reset: function (state) {
                    gpf.interfaces.ignoreParameter(state);
                },

                /**
                 * item evaluation with a character
                 *
                 * @param {Object} state Free structure containing current state
                 * @param {String} char character to test the pattern with
                 * @return {Number} Matching result, see PatternItem.WRITE_xxx
                 * @abstract
                 */
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    gpf.interfaces.ignoreParameter(char);
                    gpf.Error.Abstract();
                    return -1;
                }

                //endregion

            },

            static: {

                PARSE_IGNORED: 0,
                PARSE_PROCESSED: 1,
                PARSE_END_OF_PATTERN: 2,
                PARSE_PROCESSED_EOP: 3, // PROCESSED + END OF PATTERN

                CHARS_QUANTIFICATION: "?*+",

                WRITE_NO_MATCH: -1,
                WRITE_NEED_DATA: 0,
                WRITE_MATCH: 1

            }

        }),

        /**
         * Char pattern: recognizes one character
         *
         * @class PatternChar
         * @extend PatternItem
         * @private
         */
        PatternChar = gpf.define("PatternChar", PatternItem, {

            private: {

                /**
                 * The character to match
                 *
                 * @type {string}
                 * @private
                 */
                _match: ""

            },

            public: {

                /**
                 * @inheritDoc PatternItem:parse
                 */
                parse: function (char) {
                    this._match = char;
                    return PatternItem.PARSE_PROCESSED_EOP;
                },

                /**
                 * @inheritDoc PatternItem:write
                 */
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    if (char === this._match) {
                        return PatternItem.WRITE_MATCH;
                    }
                    return PatternItem.WRITE_NO_MATCH;
                }

            }

        }),

        /**
         * Range pattern: recognizes one char defined by a range
         * (using include/exclude patterns)
         *
         * @class PatternRange
         * @extend PatternItem
         * @private
         */
        PatternRange = gpf.define("PatternRange", PatternItem, {

            private: {

                /**
                 * Included characters
                 *
                 * @type {string|string[]}
                 * @private
                 */
                _inc: "",

                /**
                 * Excluded characters
                 *
                 * @type {string|string[]}
                 * @private
                 */
                _exc: "",

                /**
                 * While parsing: the next char is used for a range
                 * specification
                 *
                 * @type {Boolean}
                 * @private
                 */
                _inRange: false,

                /**
                 * Reduce the cyclomatic complexity of parse
                 *
                 * @param {String} char Character to parse
                 * @param {String[]} chars Character array of already parsed
                 * chars
                 * @return {Boolean} True means PARSE_PROCESSED_EOP, otherwise
                 * PARSE_PROCESSED is returned
                 */
                _parse: function (char, chars) {
                    var
                        first,
                        last;
                    if ("^" === char) {
                        this._exc = [];
                    } else if ("]" === char) {
                        if (this._inRange) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        return true;
                    } else if ("-" === char) {
                        if (this._inRange || 0 === chars.length) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        this._inRange = true;
                    } else {
                        if (this._inRange) {
                            first = chars[chars.length - 1].charCodeAt(0);
                            last = char.charCodeAt(0);
                            while (--last > first) {
                                chars.push(String.fromCharCode(last));
                            }
                            chars.push(char);
                            delete this._inRange;
                        } else {
                            // First char of a range
                            chars.push(char);
                        }
                    }
                    return false;
                }

            },

            public: {

                /**
                 * @inheritDoc PatternItem:parse
                 */
                parse: function (char) {
                    var
                        chars;
                    if (this.hasOwnProperty("_exc")) {
                        if ("^" === char) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        chars = this._exc;
                    } else {
                        chars = this._inc;
                    }
                    if ("[" === char) {
                        if (this.hasOwnProperty("_inc")) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        this._inc = [];
                    } else if (this._parse(char, chars)) {
                        return PatternItem.PARSE_PROCESSED_EOP;
                    }
                    return PatternItem.PARSE_PROCESSED;
                },

                /**
                 * @inheritDoc PatternItem:finalize
                 */
                finalize: function () {
                    this._inc = this._inc.join("");
                    if (this.hasOwnProperty("_exc")) {
                        this._exc = this._exc.join("");
                    }
                },

                /**
                 * @inheritDoc PatternItem:write
                 */
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    var match;
                    if (this._inc.length) {
                        match = -1 < this._inc.indexOf(char);
                    } else {
                        match = true;
                    }
                    if (match && this._exc.length) {
                        match = -1 === this._exc.indexOf(char);
                    }
                    if (match) {
                        return PatternItem.WRITE_MATCH;
                    } else {
                        return PatternItem.WRITE_NO_MATCH;
                    }
                }

            }

        }),

        /**
         * Group pattern: group several patterns
         * May also be a 'choice' pattern
         *
         * @class PatternGroup
         * @extend PatternItem
         * @private
         */
        PatternGroup = gpf.define("PatternGroup", PatternItem, {

            private: {

                /**
                 * Contains either an item list or a list of item list
                 * (if transformed into a choice)
                 *
                 * @type {PatternItem[]|(PatternItem[])[]}
                 * @private
                 */
                _items: [],

                /**
                 * Choice group (with |)
                 *
                 * @type {Boolean}
                 * @private
                 */
                _choice: false,

                /**
                 * True if the opening parenthesis has been parsed
                 *
                 * @type {Boolean}
                 * @private
                 */
                _parsedParenthesis: false,

                /**
                 * Currently parsed item
                 *
                 * @type {PatternItem}
                 * @private
                 */
                _parsedItem: null,

                /**
                 * Get the current list of items
                 *
                 * @param {Number} [pos=undefined] When choices, get the items
                 * at the given position (last one when undefined). Ignored
                 * otherwise.
                 * @return {PatternItem[]}
                 * @private
                 */
                _getItems: function (pos) {
                    if (this._choice) {
                        if (undefined === pos) {
                            pos = this._items.length - 1;
                        }
                        return this._items[this._items.length - 1];
                    }
                    return this._items;
                },

                /**
                 * Get the last parsed item
                 *
                 * @type {PatternItem}
                 * @private
                 */
                _lastItem: function () {
                    var
                        items = this._getItems();
                    return items[items.length - 1];
                },

                /**
                 * Push a new item to be parsed
                 *
                 * @param {PatternItem} item
                 * @return {PatternItem}
                 * @private
                 */
                _push: function (item) {
                    this._getItems().push(item);
                    this._parsedItem = item;
                    return item;
                },

                /**
                 * Reduce the cyclomatic complexity of parse
                 * Process current item
                 *
                 * @param {String} char
                 * @returns {Number}
                 * @private
                 */
                _parseItem: function (char) {
                    var
                        parsedItem = this._parsedItem,
                        result;
                    if (parsedItem) {
                        result = parsedItem.parse(char);
                        if (bitTest(result, PatternItem.PARSE_END_OF_PATTERN)) {
                            parsedItem.finalize();
                            this._parsedItem = null;
                            // Remove the flag
                            result = bitClear(result,
                                PatternItem.PARSE_END_OF_PATTERN);
                        }
                    } else {
                        result = 0;
                    }
                    return result;
                },

                /**
                 * Reduce the cyclomatic complexity of parse
                 * Process quantification char
                 *
                 * @param {String} char
                 * @returns {Number}
                 * @private
                 */
                _parseQuantity: function (char) {
                    var
                        parsedItem = this._lastItem();
                    if ("*" === char) {
                        parsedItem._min = 0;
                        parsedItem._max = 0;
                    } else if ("+" === char) {
                        parsedItem._max = 0;
                    } else if ("?" === char) {
                        parsedItem._min = 0;
                    }
                    return PatternItem.PARSE_PROCESSED;
                },

                /**
                 * Handles situation when current item does not match on char
                 *
                 * @param {String} char
                 * @return {Number} write result
                 * @private
                 */
                _writeNoMatch: function (char) {
                    var
                        state = this._state,
                        item = this._item;
                    if (state.count < item.min() // Not enough match
                        // or at least two characters went through
                        || state.length > state.matchingLength + 1) {
                        // Terminal error
                        state.result = -1;
                        this._item = null; // No need to go any further
                        return -1;
                    }
                    item = this._getNext(item);
                    if (null === item) {
                        if (0 === state.matchingLength) {
                            state.result = -1;
                        } else {
                            state.result = state.matchingLength;
                        }
                        this._item = null;
                        return state.result;
                    }
                    item.reset(state);
                    this._item = item;
                    state.count = 0;
                    --state.length;
                    return this.write(char); // Try with this one
                },

                /**
                 * Handles situation when current item matches on char
                 *
                 * @return {Number} write result
                 * @private
                 */
                _writeMatch: function (state) {
                    var
                        item = this._item,
                        nextItem = this._getNext(item);
                    state.matchingLength = state.length;
                    ++state.count;
                    if (0 === item.max()) {
                        // Unlimited
                        item.reset(state);
                        if (null !== nextItem) {
                            state.result = PatternItem.WRITE_NEED_DATA;
                        } else {
                            // Last item with unlimited occurrences
                            state.result = state.length;
                        }
                    } else if (state.count === item.max()) {
                        item = nextItem;
                        this._item = item;
                        if (null === item) {
                            state.result = state.length;
                        } else {
                            item.reset(state);
                            state.count = 0;
                            state.result = 0;
                            if (0 === item.min()) {
                                // TODO this search should be done only once
                                nextItem = this._getNext(item);
                                while (nextItem && 0 === nextItem.min()) {
                                    nextItem = this._getNext(nextItem);
                                }
                                if (!nextItem) {
                                    // The rest being optional...
                                    state.result = state.matchingLength;
                                }
                            }
                        }
                    } else {
                        state.result = PatternItem.WRITE_NEED_DATA;
                    }
                    return state.result;
                }

            },

            public: {

                /**
                 * @constructor
                 */
                constructor: function () {
                    this._items = [];
                },

                /**
                 * @inheritDoc PatternItem:parse
                 */
                parse: function (char) {
                    var
                        result = this._parseItem(char);
                    if (0 !== result) {
                        return result;
                    }
                    if (-1 < PatternItem.CHARS_QUANTIFICATION.indexOf(char)) {
                        return this._parseQuantity(char);
                    }
                    if ("|" === char) {
                        if (!this._choice) {
                            this._items = [this._items];
                            this._choice = true;
                        }
                        this._items.push([]);
                        return PatternItem.PARSE_PROCESSED;
                    } else if ("[" === char) {
                        this._push(new PatternRange());
                    } else if ("(" === char) {
                        if (this._parsedParenthesis) {
                            this._push(new PatternGroup());
                        } else {
                            this._parsedParenthesis = true;
                            return PatternItem.PARSE_PROCESSED;
                        }
                    } else if (")" === char) {
                        return PatternItem.PARSE_PROCESSED_EOF;
                    } else {
                        this._push(new PatternChar());
                    }
                    return this._parseItem(char);
                },

                /**
                 * @inheritDoc PatternItem:finalize
                 */
                finalize: function () {
                    // Nothing to do for now
                    // TODO in case of choice, verify they are exclusive
                },

                /**
                 * @inheritDoc PatternItem:reset
                 */
                reset: function (state) {
                    state.index = 0;
                    state.sub = {};
                    if (this._choice) {
                        state.choice = -1;
                    } else {
                        this._getItems(0)[0].reset(state.sub);
                    }
                },

                /**
                 * @inheritDoc PatternItem:write
                 */
                write: function (state, char) {
                    var
                        result;
                    if (this._choice && -1 === state.choice) {
                        // Not YET
                        gpf.Error.NotImplemented();
                    } else {
                        result = this._items[state.index].write(state, char);
                    }
                    if (PatternItem.WRITE_NEED_DATA === result) {
                        return result;
                    } else if (PatternItem.WRITE_NO_MATCH === result) {
                        return this._writeNoMatch(state, char);
                    } else {
                        return this._writeMatch(state);
                    }
                }

            }

        }),

//        /**
//         * Choice pattern: includes several items, matching only one among
// them
//         *
//         * @class PatternChoice
//         * @extend PatternItem
//         * @private
//         */
//        PatternChoice = gpf.define("PatternChoice", PatternItem, {
//
//            public: {
//
////                /**
////                 * @inheritDoc PatternItem:next
////                 *
////                 * Overridden to 'add' the choice
////                 */
////                next: function (item) {
////                    if (undefined === item) {
////                        /*
////                         * The only way to have something *after* is to use
// ()
////                         * In that case, it would go through the parent
////                         */
////                        return null;
////                    } else {
////                        var
////                            parent = item.parent(),
////                            pos;
////                        this._choices.push(item);
////                        item.parent(this);
////                        if (1 === this._choices.length) {
////                            // Care about parent
////                            if (null === parent) {
////                                return; // Nothing to care about
////                            }
////                            if (parent.type() !== PatternItem.TYPE_GROUP) {
////                                gpf.Error.PatternUnexpected();
////                            }
////                            // TODO should be the last
////                            pos = gpf.test(parent._items, item);
////                            if (undefined === pos) {
////                                gpf.Error.PatternUnexpected();
////                            }
////                            parent._items[pos] = this;
////                            this._parent = parent;
////                        }
////                    }
////                },
//
//                /**
//                 * @inheritDoc PatternItem:write
//                 */
//                write: function (state, char) {
//                    // Try all choices and stop on the first one that works
//                    var
//                        tmpState = {},
//                        idx,
//                        item,
//                        result;
//                    for (idx = this._choices.length; idx > 0;) {
//                        item = this._choices[--idx];
//                        item.reset(tmpState);
//                        result = item.write(tmpState, char);
//                        if (PatternItem.WRITE_NO_MATCH !== result) {
//                            state.replaceItem = item;
//                            gpf.extend(state, tmpState);
//                            return result;
//                        }
//                    }
//                    return PatternItem.WRITE_NO_MATCH;
//                }
//
//            }
//
//        }),

        /**
         * Pattern parser context.
         * Class used to parse a pattern, will allocated and consolidate
         * PatternItems
         *
         * @class PatternParserContext
         * @extend gpf.Parser
         * @private
         */
        PatternParser = gpf.define("PatternParser",  gpf.Parser, {

            private: {

                /**
                 * @type {PatternGroup}
                 * @private
                 */
                "[_patternItem]": [gpf.$ClassProperty()],
                _patternItem: null

            },

            protected: {

                /**
                 * @inheritdoc gpf.Parser:_initialParserState
                 */
                _initialParserState: function (char) {
                    this._patternItem.parse(char);
                },

                /**
                 * @inheritdoc gpf.Parser:_finalizeParserState
                 */
                _finalizeParserState: function () {
                    var patternItem = this._patternItem;
                    patternItem.parse(")");
                    patternItem.finalize();
                }

            },

            public: {

                constructor: function () {
                    this._super.apply(this, arguments);
                    this._patternItem = new PatternGroup();
                    this._patternItem.parse("(");
                }

            }

        }),

        /**
         * Pattern tokenizer
         *
         * @class {PatternTokenizer}
         * @implements gpf.interfaces.ITokenizer
         * @private
         */
        PatternTokenizer = gpf.define("PatternTokenizer", {

            "[Class]": [gpf.$InterfaceImplement(_ITokenizer)],

            private: {

                /**
                 * @type {PatternItem}
                 * @private
                 */
                _patternItem: null,

                /**
                 * @type {Boolean}
                 * @private
                 */
                _noMatch: false,

                /**
                 * @type {Number}
                 * @private
                 */
                _lastResult: 0,

                /**
                 * @type {Number}
                 * @private
                 */
                _totalLength : 0,

                /**
                 * Pattern state
                 *
                 * @type {Object}
                 * @private
                 */
                _state: {}
            },

            public: {

                /**
                 * @param {PatternItem} patternItem
                 */
                constructor: function (patternItem) {
                    this._patternItem = patternItem;
                    this._state = {};
                    this._patternItem.reset(this._state);
                },

                //region ITokenizer

                /**
                 * @implements gpf.interfaces.ITokenizer:write
                 */
                write: function (char) {
                    var
                        result;
                    if (this._noMatch) {
                        return this._lastResult;
                    }
                    ++this._totalLength;
                    result = this._patternItem.write(this._state, char);
                    if (PatternItem.WRITE_NO_MATCH === result) {
                        this._noMatch = true;
                        if (0 === this._lastResult) {
                            this._lastResult = -1;
                        }
                    } else if (PatternItem.WRITE_MATCH === result) {
                        this._lastResult = this._totalLength;
                    }
                    return this._lastResult;
                }

                //endregion
            }
        });

    /**
     * Patterns are designed to be an efficient and stream-able alternative to
     * regular expressions. However, the coverage is not the same
     *
     * Supported operators:
     *  [a-z^0-9], [^abc], ., ?, +, *
     *  [^a-z] exclude
     *  . any character
     *
     *
     * @class gpf.Pattern
     */
    gpf.define("gpf.Pattern", {

        private: {

            /**
             * @type {PatternItem}
             * @private
             */
            _patternItem: null

        },

        public: {

            /**
             * Constructor, check and compile the pattern
             *
             * @param {String} pattern
             */
            constructor: function (pattern) {
                var
                    parser = new PatternParser();
                parser.parse(pattern, null);
                this._patternItem = parser.patternItem();
            },

            /**
             * Allocate a tokenizer based on the pattern
             *
             * @return {gpf.interfaces.ITokenizer}
             */
            allocate: function () {
                return new PatternTokenizer(this._patternItem);
            }

        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/