/**
 * @file gpf.attributes.ClassAttribute attribute
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttributesClassAttribute*/ // Shortcut for gpf.attributes.ClassAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the class level
 *
 * @class gpf.attributes.ClassAttribute
 * @since 0.2.8
 */
var _gpfAttributesClassAttribute = _gpfDefine({
    $class: "gpf.attributes.ClassAttribute",
    $extend: _gpfAttributesAttributeAttribute,

    _targetCheck: function (member, classDefinition) {
        _gpfAttributesCheckClassOnly(member);
        _gpfIgnore(classDefinition);
    }

});

gpf.attributes.ClassAttribute = _gpfAttributesClassAttribute;
