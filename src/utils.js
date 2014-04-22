/**
 * Utility functions.
 */

'use strict';

var
  NATIVE_TYPES = require('./nativetypes.js');


/**
 * Checks if the given type is a native javascript type.
 * @param {String} type Type to be checked.
 * @return {Boolean}
 */
function isNativeType(type) {
  return !!~NATIVE_TYPES.indexOf(type);
}


/**
 * Makes a deep copy of the given object.
 * Note: this is a quick and non-optimal solution, but as this method is
 * supposed to be used only during app initialization, it's good enough for now.
 * @param {*} obj Object to be copied.
 * @return {Object} Deep copy of the given object.
 */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/**
 * Checks if the object is a plain-old javascript object (not created with any
 * constructor other than {@code Object}).
 * @param {*} val Value to be checked.
 * @return {Boolean}
 * @private
 */
function _isPlainOldObject(val) {
  return !!(val && val.constructor && val.constructor.name === 'Object');
}


/**
 * Deeply extends the given target object with the properties of the following
 * source objects.
 *
 * Note that the target object WILL be changed. Note also that if a parameter is
 * repeated in the target and in one or more source objects, it will be
 * overriden and the one defined in the latest object passed to the function
 * will prevail.
 *
 * @param {Object} target The object to which the updates should be applied to.
 * @param {...Object} source Objects from which the parameters should be taken.
 * @return {Object} The target object (already extended/updated).
 */
function deepExtend(target) {
  var
    sources = Array.prototype.slice.apply(arguments, 1),
    source,
    val,
    key,
    len,
    i;


  for (i = 0, len = sources.length; i < len; i += 1) {
    source = sources[i];

    for (key in source) {
      if (source.hasOwnProperty(key)) {
        sourceVal = source[key];
        targetVal = target[key];

        if (_isPlainOldObject(targetVal) && _isPlainOldObject(sourceVal)) {
          deepExtend(targetVal, sourceVal);
        } else {
          target[key] = Array.isArray(sourceVal) ||
              _isPlainOldObject(sourceVal) ?
            deepCopy(targetVal) :
            targetVal;
        }
      }
    }
  }

  return target;
}


module.exports = {
  isNativeType : isNativeType,
  deepCopy : deepCopy,
  deepExtend : deepExtend
};
