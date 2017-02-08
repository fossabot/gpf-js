/**
 * @file Check entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*#endif*/

/**
 * Generate an array of names prefixed with $ from a comma separated list
 *
 * @param {String} names Comma separated list of name
 * @return {String[]} Array of names prefixed with "$"
 * @since 0.1.6
 */
function _gpfDefineGenerate$Keys (names) {
    return names.split(",").map(function (name) {
        return "$" + name;
    });
}

_gpfErrorDeclare("define/check", {
    /**
     * ### Summary
     *
     * One of the $ properties is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * The list of possible $ properties is fixed and depends on the entity type.
     * This error is thrown when one $ property is not allowed.
     * @since 0.1.6
     */
    invalidEntity$Property: "Invalid entity $ property",

    /**
     * ### Summary
     *
     * Entity name is missing in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity name is missing
     * @since 0.1.6
     */
    missingEntityName: "Missing entity name",

    /**
     * ### Summary
     *
     * Entity namespace is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the namespace is invalid
     * @since 0.1.6
     */
    invalidEntityNamespace: "Invalid entity namespace"

});

function _gpfDefineEntityCheckNameIsNotEmpty () {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    if (!this._name) {
        gpf.Error.missingEntityName();
    }
    /*eslint-enable no-invalid-this*/
}

function _gpfDefineEntityCheckProperty (value, name) {
    _gpfIgnore(value);
    /*jshint -W040*/ /*eslint-disable no-invalid-this*/ // bound through thisArg
    if (name.charAt(0) === "$") {
        this._check$Property(name, value);
    } else {
        this._checkProperty(name, value);
    }
    /*jshint -W040*/ /*eslint-enable no-invalid-this*/
}

Object.assign(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */ {

    /**
     * Entity type (class...)
     *
     * @readonly
     * @since 0.1.6
     */
    _type: "",

    /**
     * List of allowed $ properties
     *
     * @type {String[]}
     * @readonly
     * @since 0.1.6
     */
    _allowed$Properties: _gpfDefineGenerate$Keys("type,name,namespace"),

    /**
     * Check if the $ property is allowed
     *
     * @param {String} name $ Property name
     * @param {*} value $ Property value
     * @see _GpfEntityDefinition.prototype._allowed$Properties
     * @throws {gpf.Error.InvalidEntity$Property}
     * @since 0.1.6
     */
    _check$Property: function (name, value) {
        _gpfIgnore(value);
        if (-1 === this._allowed$Properties.indexOf(name)) {
            gpf.Error.invalidEntity$Property();
        }
    },

    /**
     * Check if the property is allowed
     * NOTE: $ properties are handled by {@link _check$Property}
     *
     * @param {String} name Property name
     * @param {*} value Property value
     * @since 0.1.6
     */
    _checkProperty: _gpfFunc(["name", "value"], " "),

    /**
     * Check the properties contained in the definition passed to {@link gpf.define}
     * @since 0.1.6
     */
    _checkProperties: function () {
        _gpfObjectForEach(this._initialDefinition, _gpfDefineEntityCheckProperty, this);
    },

    /**
     * Entity name
     * @since 0.1.6
     */
    _name: "",

    /**
     * Compute name property
     * @since 0.1.6
     */
    _readName: function () {
        var definition = this._initialDefinition;
        this._name = definition["$" + this._type] || definition.$name;
    },

    /**
     * Check if name property is not empty (throw the error otherwise)
     *
     * @throws {gpf.Error.MissingEntityName}
     * @since 0.1.6
     */
    _checkNameIsNotEmpty: _gpfDefineEntityCheckNameIsNotEmpty,

    /**
     * Check name property (content)
     *
     * @throws {gpf.Error.MissingEntityName}
     * @since 0.1.6
     */
    _checkName: _gpfDefineEntityCheckNameIsNotEmpty,

    /**
     * Entity namespace
     * @since 0.1.6
     */
    _namespace: "",

    /**
     * If the name is prefixed with a namespace, isolate it and update name property
     *
     * @return {String|undefined} Namespace contained in the name or undefined if none
     * @since 0.1.6
     */
    _extractRelativeNamespaceFromName: function () {
        var parts = new RegExp("(.*)\\.([^\\.]+)$").exec(this._name);
        if (parts) {
            this._name = parts[2];
            return parts[1];
        }
    },

    /**
     * Compute namespace property
     * @since 0.1.6
     */
    _readNamespace: function () {
        var namespaces = [
            this._initialDefinition.$namespace,
            this._extractRelativeNamespaceFromName()
        ].filter(function (namespacePart) {
            return namespacePart;
        });
        if (namespaces.length > 0) {
            this._namespace = namespaces.join(".");
        }
    },

    /**
     * Check namespace property
     *
     * @throws {gpf.Error.InvalidEntityNamespace}
     * @since 0.1.6
     */
    _checkNamespace: function () {
        if (!new RegExp("^(:?[a-z_$][a-zA-Z0-9]+(:?\\.[a-z_$][a-zA-Z0-9]+)*)?$").exec(this._namespace)) {
            gpf.Error.invalidEntityNamespace();
        }
    },

    check: function () {
        this._checkProperties();
        this._readName();
        this._checkNameIsNotEmpty();
        this._readNamespace();
        this._checkName();
        this._checkNamespace();
    }

});
