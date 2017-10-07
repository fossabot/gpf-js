/**
 * @file Regular Expression helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*#endif*/

/**
 * Callback function executed on each regular expression match
 *
 * @callback gpf.typedef.regExpForEachCallback
 *
 * @param {Array} match The current match
 * @param {String} string The string that is currently being matched
 * @since 0.2.1
 */

/**
 * Executes the callback for each match of the regular expression.
 * When configured with /g and used before,
 * the [lastIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)
 * must be first reset
 *
 * @param {RegExp} regexp Regular expression to execute
 * @param {String} string String to match
 * @param {gpf.typedef.regExpForEachCallback} callback Callback function executed on each match
 * @return {Number} Number of occurrences
 * @since 0.2.1
 * @version 0.2.2 Returns the number of occurrences
 */
function _gpfRegExpForEach (regexp, string, callback) {
    var match,
        count = 0;
    /*jshint -W084*/ // to avoid repeating twice the exec
    while (match = regexp.exec(string)) { //eslint-disable-line no-cond-assign
        callback(match, string);
        ++count;
    }
    return count;
}
/*jshint +W084*/
