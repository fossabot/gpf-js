(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    /*                                                                         |
     * First of all, apply JSlint with:                                        |
     * - Tolerate continue                                                     |
     * - Tolerate dangling _ in identifiers                                    |
     * - Tolerate ++ and --                                                    |
     *                                                                         |
     * Tabs must be replaced with 4 spaces                                     |
     * *NEVER* go over column 80                                               |
     *                                                                         |
     * try to lower the use of closures                                        |
     */
    function actionWithAdditionalKeywords (firstParameter, secondParameter) {
        var
            firstVariable,
            secondVariable,
            // Initialized variables must be the last ones
            // Try to avoid function calls in there
            thirdVariable = 0; // Initialized
    }

    /**
     * Any function triggering events
     * 
     * @param {any} param1
     * @param {object/function} eventsHandler
     * @returns {undefined}
     *
     * @event sample This is the sample event
     * @eventParam {any} ctx1 the first event parameter
     */
    function triggerEvent(param1, eventsHandler) {
        gpf.events.fire.apply(this, ['sample', {ctx1: param1}, eventsHandler]);
    }

    namspace.newClass = gpf.Class.extend({

        /*
         * Modifier can be: abstract, const
         */
        method: function /*modifier*/ () {

        }

    });

/*
 * gpf          base functions & helpers
 *   event      event model
 *   http       HTTP related
 *   bin        BINARY related
 *   xml        XML related
 *   js         JavaScript language related
 *   Class      the base class of gpf classes
 *   attributes ATTRIBUTES related
 */

}()); /* End of privacy scope */
