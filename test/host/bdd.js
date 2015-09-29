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

    var Runner = (function (callback) {
        this._state = Runner.STATE_DESCRIBE_BEFORE;
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
    }).toClass(Object, {

        // The current state
        _state: 0,

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

        // @property {function[]} List of callbacks to process (before, beforeEach, ...)
        _pendingCallbacks: [],

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
         * @return {Boolean} true if asynchronous
         */
        _processCallback: function (callback) {
            try {
                callback(this._boundNext);
                return 0  !== callback.length;
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
            return true;
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

        // Next step in test
        _doNext: function () {
            do {
                // Check if any pending callback
                while (this._pendingCallbacks.length) {
                    if (this._processCallback(this._pendingCallbacks.shift())) {
                        // Asynchronous, have to wait for callback
                        return;
                    }
                }
            // _state contains the member to execute
            } while (this[this._state]());
        },

        // STATE_DESCRIBE_BEFORE
        _onDescribeBefore: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(describe.before);
            return true;
        },

        // STATE_DESCRIBE_CHILDREN
        _onDescribeChildren: function () {
            var children = this._describe.children;
            if (this._childIndex < children.length) {
                var item = children[this._childIndex++];
                if (item instanceof BDDDescribe) {
                    this._stackDescribe(item);

                } else if (item instanceof BDDIt) {
                    this._state = Runner.STATE_DESCRIBE_CHILDIT_BEFORE;
                    this._it = item;
                }
            } else {
                this._state = Runner.STATE_DESCRIBE_AFTER;
            }
            return true;
        },

        // STATE_DESCRIBE_CHILDREN: describe found
        _stackDescribe: function (describe) {
            this._describeState = Runner.STATE_DESCRIBE_BEFORE;
            this._runCallback("describe", {
                depth: this._describes.length,
                label: describe.label
            });
            this._describes.push(this._describe);
            this._childIndexes.push(this._childIndex);
            // Concatenate lists of beforeEach and afterEach
            this._beforeEach = this._beforeEach.concat(describe.beforeEach);
            this._afterEach = describe.afterEach.concat(this._afterEach);
            // Becomes the new describe
            this._describe = describe;
            this._childIndex = 0;
        },

        // STATE_DESCRIBE_CHILDIT_BEFORE
        _onItBefore: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDIT_EXECUTE;
            this._pendingCallbacks = [].concat(this._beforeEach);
            return true;
        },

        // STATE_DESCRIBE_CHILDIT_EXECUTE
        _onItExecute: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDIT_AFTER;
            var it = this._it;
            ++this._statistics.count;
            if (it.callback) {
                this._processItCallback(it.callback);
                return false;
            } else {
                ++this._statistics.pending;
                this._runCallback("it", {
                    depth: this._describes.length,
                    label: this._it.label,
                    pending: true
                });
                return true;
            }
        },

        // STATE_DESCRIBE_CHILDIT_AFTER
        _onItAfter: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(this._afterEach);
            return true;
        },

        // STATE_DESCRIBE_AFTER
        _onDescribeAfter: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_DONE;
            this._pendingCallbacks = [].concat(describe.after);
            return true;
        },

        // STATE_DESCRIBE_DONE
        _onDescribeDone: function () {
            if (0 < this._describes.length) {
                // What's in the describe stack
                this._unstackDescribe();

            } else {
                // DONE!
                this._runCallback("results", this._statistics);
            }
        },

        _unstackDescribe: function () {
            // call after if any
            var currentDescribe = this._describe;
            if (currentDescribe.after.length && this._describeState !== "end") {
                this._describeState = "end";
                this._pendingCallbacks = [].concat(currentDescribe.after);
                this.next();
                return;
            }
            // Remove lists of beforeEach and afterEach
            this._beforeEach = this._beforeEach.slice(0, this._beforeEach.length - currentDescribe.beforeEach.length);
            this._afterEach = this._afterEach.slice(currentDescribe.afterEach.length);
            // No more children, go up
            this._describe = this._describes.pop();
            this._childIndex = this._childIndexes.pop();
            this.next();
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

    }, {
        STATE_DESCRIBE_BEFORE: "_onDescribeBefore",
        STATE_DESCRIBE_CHILDREN: "_onDescribeChildren",
        STATE_DESCRIBE_CHILDIT_BEFORE: "_onItBefore",
        STATE_DESCRIBE_CHILDIT_EXECUTE: "_onItExecute",
        STATE_DESCRIBE_CHILDIT_AFTER: "_onItAfter",
        STATE_DESCRIBE_AFTER: "_onDescribeAfter",
        STATE_DESCRIBE_DONE: "_onDescribeDone"
    });

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
