(function (context) {
    "use strict";

    if ("object" === typeof global) {
        context = global;
    }

    /**
     * Simple BDD implementation
     */

    // Enumeration helper
    function _objectForEach(dictionary, callback, thisArg) {
        for (var property in dictionary) {
            if (dictionary.hasOwnProperty(property)) {
                callback.apply(thisArg, [dictionary[property], property, dictionary]);
            }
        }
    }

    //region BDD item classes

    Function.prototype.toClass = function (BaseClass, members, statics) {
        this.prototype = new BaseClass();
        _objectForEach(members, function (memberValue, memberName) {
            this.prototype[memberName] = memberValue;
        }, this);
        _objectForEach(statics, function (memberValue, memberName) {
            this[memberName] = memberValue;
        }, this);
        return this;
    };

    /**
     * Abstract item
     *
     * @param {String} label
     * @constructor
     */
    var BDDAbstract  = (function (label, parent) {
        if (undefined !== parent) {
            this.parent = parent;
            if (parent instanceof BDDDescribe) {
                if (!parent.hasOwnProperty("children")) {
                    // Make the array unique to the instance
                    parent.children = [];
                }
                parent.children.push(this);
            }
        }
        this.label = label;
    }).toClass(Object, {

        // @property {BDDAbstract} Parent item
        parent: null,

        // Label of the item
        label: ""

    }, {});

    /**
     * Test description
     *
     * @constructor
     * @param {String} label
     * @class BDDDescribe
     * @extends BDDAbstract
     */
    var BDDDescribe = (function (/*label, parent*/) {
        BDDAbstract.apply(this, arguments);
    }).toClass(BDDAbstract, {

        // @prototype {BDDDescribe[]} Children of the description
        children: [],

        // @property {Function[]} List of before callbacks
        before: [],

        // @property {Function[]} List of beforeEach callbacks
        beforeEach: [],

        // @property {Function[]} List of afterEach callbacks
        afterEach: [],

        // @property {Function[]} List of after callbacks
        after: []

    }, {

        // @property {BDDDescribe} Root test folder
        root: null,

        // @property {BDDDescribe} Current test folder
        current: null,

        /**
         * Added the callback to the list which member name is provided
         *
         * @param {String} listName List member name
         * @param {Function} callback
         */
        addCallback: function (listName, callback) {
            var current = BDDDescribe.current;
            if (!current.hasOwnProperty(listName)) {
                // Make the array unique
                current[listName] = [];
            }
            current[listName].push(callback);
        }

    });

    /**
     * Test case
     *
     * @constructor
     * @param {String} label
     * @param {Function} callback
     * @class BDDIt
     * @extends BDDAbstract
     */
    var BDDIt = (function (label, callback, parent) {
        BDDAbstract.apply(this, [label, parent]);
        this.callback = callback;
    }).toClass(BDDAbstract, {

        // @prototype {Function} Test case callback (null if pending)
        callback: null

    }, {});

    //endregion BDD item classes

    //region BDD public interface

    _objectForEach({

        describe: function (label, callback) {
            if (null === BDDDescribe.root) {
                BDDDescribe.current = BDDDescribe.root = new BDDDescribe();
            }
            BDDDescribe.current = new BDDDescribe(label, BDDDescribe.current);
            callback();
            BDDDescribe.current = BDDDescribe.current.parent;
        },

        before: function (callback) {
            BDDDescribe.addCallback("before", callback);
        },

        beforeEach: function (callback) {
            BDDDescribe.addCallback("beforeEach", callback);
        },

        it: function (label, callback) {
            return new BDDIt(label, callback, BDDDescribe.current);
        },

        afterEach: function (callback) {
            BDDDescribe.addCallback("afterEach", callback);
        },

        after: function (callback) {
            BDDDescribe.addCallback("after", callback);
        },

        /**
         * Fails by throwing an exception if the value is falsy
         *
         * @param {*} condition
         */
        assert: function (condition) {
            if (!condition) {
                throw {
                    message: "ASSERTION failed"
                };
            }
        }

    }, function (memberValue, memberName) {
        if (!this[memberName]) {
            this[memberName] = memberValue;
        }
    }, context);

    //endregion  BDD public interface

    //region default callback (based on console.log)

    function _output (text, level) {
        if (undefined === level) {
            level = "log";
        }
        // Console can be mocked up to check outputs
        if (console.expects) {
            console.expects(level, text, true);
        }
        console[level](text);
    }

    var _handlers = {

        /**
         * describe callback
         *
         * @param {Object} data
         * - {Number} depth item depth
         * - {String} label item label
         */
        "describe": function (data) {
            _output((new Array(data.depth + 1).join("\t")) + data.label);
        },

        /**
         * it callback
         *
         * @param {Object} data
         * - {Number} depth item depth
         * - {String} label item label
         * - {Boolean} pending test with no implementation
         * - {Boolean} result test result
         * - {Object} exception exception details
         */
        "it": function (data) {
            var line = (new Array(data.depth + 1).join("\t"));
            if (data.pending) {
                line += "-- ";
            } else if (data.result) {
                line += "OK ";
            } else {
                line += "KO ";
            }
            line += data.label;
            _output(line);
            if (false === data.result && data.exception) {
                for (var key in data.exception) {
                    if (data.exception.hasOwnProperty(key)) {
                        _output(key + ": " + data.exception[key]);
                    }
                }
            }
        },

        /**
         * results callback
         *
         * @param {Object} data
         * - {Number} count number of tests
         * - {Number} success succeeded count
         * - {Number} fail failed count
         * - {Number} pending tests with no implementation
         */
        "results": function (data) {
            _output("--- Results: ");
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    _output(key + "        : ".substr(key.length)
                        + data[key]);
                }
            }
            if (data.fail) {
                _output("KO", "error");
                gpf.exit(data.fail);
            } else {
                _output("OK");
                gpf.exit(0);
            }
        }
    };

    function _defaultCallback (type, data) {
        /*jshint validthis:true*/
        _handlers[type].apply(this, [data]);
    }

    //endregion

    //region Running the tests

    function Runner(callback) {
        this._callback = callback || _defaultCallback;
        this._describes = [];
        this._describe = BDDDescribe.root;
        this._childIndexes = [];
        this._beforeEach = [];
        this._afterEach = [];
        this._statistics = {
            count: 0,
            success: 0,
            fail: 0,
            pending: 0
        };
        // Create bound version of some APIs
        this._boundNext = this.next.bind(this);
        this._boundSuccess = this._success.bind(this);
        this._boundDoNext = this._doNext.bind(this);
    }

    Runner.prototype = {

        // @property {Function} Callback used to notify the caller of the progress
        _callback: null,

        // @property {BDDDescribe[]} Stack of describe items being processed
        _describes: [],

        // @property {BDDDescribe} Current describe
        _describe: null,

        // @property {Number[]} Stack of childIndex (pointing to each describe child)
        _childIndexes: [],

        // Current child idx of current describe
        _childIndex: 0,

        // @property {function[]|null} List of callbacks to process (before, beforeEach, ...)
        _pendingCallbacks: null,

        // @property {Function[]} stacked beforeEach callbacks
        _beforeEach: [],

        // @property {Function[]} stacked afterEach callbacks
        _afterEach: [],

        // @property {BDDIt} Current it
        _it: null,

        // @property {Date} datetime when the it has been started
        _itStart: null,

        // @property {Object} Test statistics
        _statistics: {},

        /**
         * Call the it test callback
         *
         * @param {Function} callback
         */
        _processItCallback: function (callback) {
            try {
                this._itStart = new Date();
                callback(this._boundSuccess);
                if (0 === callback.length) {
                    // synchronous
                    this._success();
                }
            } catch (e) {
                this._fail(e);
            }
        },

        /**
         * Call (before|after)(Each)? callback
         *
         * @param {Function} callback
         */
        _processCallback: function (callback) {
            try {
                callback(this._boundNext);
                if (0  === callback.length) {
                    // synchronous
                    this.next();
                }
            } catch (e) {
                // TODO right now, an error is not acceptable at this point, signal and ends everything
                this._it = {
                    label: "UNEXPECTED error during (before|after)(Each)?"
                };
                this._fail(e);
                // Ends everything
                this._childIndex = this._describe.children.length;
                this._describes = [];
            }
        },

        // @property {Number} Count the number of nexts executed sequentially
        _stackedNext: 0,

        // @property {Function} next bound to this
        _boundNext: 0,

        /**
         * Next test / callback
         * Protected to limit the stack depth.
         */
        next: function () {
            if (10 === ++this._stackedNext) {
                setTimeout(this._boundDoNext, 0);
                --this._stackedNext;
                return;
            }
            this._doNext();
            --this._stackedNext;
        },

        // @property {Function} _doNext bound to this
        _boundDoNext: 0,

        // Next test / callback
        _doNext: function () {
            var item;
            // Any callback list pending?
            if (_callbacks && _callbackIdx < _callbacks.length) {
                item = _callbacks[_callbackIdx];
                ++_callbackIdx;
                _processCallback(item, false);

            } else if (_childIndex < _describe.children.length) {
                item = _describe.children[_childIndex];
                ++_childIndex;
                if (item instanceof BDDDescribe) {
                    // call before if any
                    if (item.before.length && _callbacks !== item.before) {
                        _callbacks = item.before;
                        _callbackIdx = 0;
                        --_childIndex;
                        this.next();
                        return;
                    }
                    // Notify caller
                    _runCallback("describe", {
                        depth: _describes.length,
                        label: item.label
                    });
                    _describes.push(_describe);
                    _childIndexes.push(_childIndex);
                    // Concatenate lists of beforeEach and afterEach
                    _beforeEach = _beforeEach.concat(item.beforeEach);
                    _afterEach = item.afterEach.concat(_afterEach);
                    // Becomes the new describe
                    _describe = item;
                    _childIndex = 0;
                    this.next();

                } else if (item instanceof BDDIt) {
                    // Call beforeEach if any
                    if (_it !== item
                        && _beforeEach.length && _callbacks !== _beforeEach) {
                        _callbacks = _beforeEach;
                        _callbackIdx = 0;
                        --_childIndex;
                        this.next();
                        return;
                    }
                    // Prepare list of afterEach if any
                    _callbacks = _afterEach;
                    _callbackIdx = 0;
                    // Process the item
                    _it = item;
                    ++_statistics.count;
                    if (item.callback) {
                        _processCallback(item.callback, true);
                    } else {
                        ++_statistics.pending;
                        _runCallback("it", {
                            depth: _describes.length,
                            label: _it.label,
                            pending: true
                        });
                        this.next();
                    }

                }
            } else if (0 < _describes.length) {
                // call after if any
                if (_describe.after.length && _callbacks !== _describe.after) {
                    _callbacks = item.before;
                    _callbackIdx = 0;
                    this.next();
                    return;
                }
                // Remove lists of beforeEach and afterEach
                _beforeEach = _beforeEach.slice(0, _beforeEach.length
                - _describe.beforeEach.length);
                _afterEach = _afterEach.slice(_describe.afterEach.length);
                // No more children, go up
                _describe = _describes.pop();
                _childIndex = _childIndexes.pop();
                this.next();

            } else {
                // DONE!
                _runCallback("results", _statistics);
            }
        },

        // @property {Function} _success bound to this
        _boundSuccess: 0,

        // The last it succeeded
        _success: function () {
            ++this._statistics.success;
            this._runCallback("it", {
                depth: this._describes.length,
                label: this._it.label,
                result: true,
                timeSpent: (new Date()) - this._itStart
            });
            this.next();
        },

        // The last it failed
        _fail: function (e) {
            ++this._statistics.fail;
            this._runCallback("it", {
                depth: this._describes.length,
                label: this._it.label,
                result: false,
                timeSpent: (new Date()) - this._itStart,
                exception: e
            });
            this.next();
        }

    };

    /**
     * Main entry point to run all tests
     *
     * @param {Function} callback see callback examples above
     */
    context.run = function (callback) {
        var runner = new Runner(callback);
        runner.next();
    };

    //endregion

}(this));
