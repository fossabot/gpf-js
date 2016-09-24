/**
 * @file setTimeout polyfill
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfAssert*/ // Assertion method
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

var
    // List of pending callbacks (sorted by execution time)
    _gpfTimeoutQueue = [],
    // Last allocated timeoutID
    _gpfTimeoutID = 0,
    // Sleep function
    _gpfSleep = _gpfEmptyFunc;

// Handle timeouts (mandatory for some environments)
gpf.handleTimeout = _gpfEmptyFunc;

/**
 * Sorting function used to reorder the async queue
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Number}
 * @private
 */
function _gpfSortOnDt (a, b) {
    return a.dt - b.dt;
}

function _gpSetTimeoutPolyfill (callback, timeout) {
    _gpfAssert("number" === typeof timeout, "Timeout is required");
    var timeoutItem = {
        id: ++_gpfTimeoutID,
        dt: new Date(new Date().getTime() + timeout),
        cb: callback
    };
    _gpfTimeoutQueue.push(timeoutItem);
    _gpfTimeoutQueue.sort(_gpfSortOnDt);
    return _gpfTimeoutID;
}

function _gpfClearTimeoutPolyfill (timeoutId) {
    var pos;
    /*gpf:inline(array)*/ if (!_gpfTimeoutQueue.every(function (timeoutItem, index) {
        if (timeoutItem.id === timeoutId) {
            pos = index;
            return false;
        }
        return true;
    })) {
        _gpfTimeoutQueue.splice(pos, 1);
    }
}

function _gpfHandleTimeout () {
    var queue = _gpfTimeoutQueue,
        timeoutItem,
        now;
    while (queue.length) {
        timeoutItem = queue.shift();
        now = new Date();
        if (timeoutItem.dt > now) {
            _gpfSleep(timeoutItem.dt - now);
        }
        timeoutItem.cb();
    }
}

// Used only for WSCRIPT & RHINO environments
/* istanbul ignore next */
if ("undefined" === typeof setTimeout) {

    /*jshint wsh: true*/
    /*eslint-env wsh*/
    /*jshint rhino: true*/
    /*eslint-env rhino*/

    if (_GPF_HOST_WSCRIPT === _gpfHost) {
        _gpfSleep =  function (t) {
            WScript.Sleep(t); //eslint-disable-line new-cap
        };
    } else if (_GPF_HOST_RHINO === _gpfHost) {
        _gpfSleep = java.lang.Thread.sleep;
    } else {
        console.warn("No implementation for setTimeout");
    }

    _gpfMainContext.setTimeout = _gpSetTimeoutPolyfill;
    _gpfMainContext.clearTimeout = _gpfClearTimeoutPolyfill;
    gpf.handleTimeout = _gpfHandleTimeout;

}

/*#ifndef(UMD)*/

gpf.internals._gpfTimeoutQueue = _gpfTimeoutQueue;
gpf.internals._gpSetTimeoutPolyfill = _gpSetTimeoutPolyfill;
gpf.internals._gpfClearTimeoutPolyfill = _gpfClearTimeoutPolyfill;
gpf.internals._gpfHandleTimeout = _gpfHandleTimeout;

/*#endif*/
