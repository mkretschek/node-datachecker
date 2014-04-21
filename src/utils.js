
'use strict';

var
  NATIVE_TYPES = require('./nativetypes.js');


function isNativeType(type) {
  return !!~NATIVE_TYPES.indexOf(type);
}


function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}



function _isPlainOldObject(val) {
  return val && val.constructor && val.constructor.name === 'Object';
}


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
          target[key] = Array.isArray(sourceVal) || _isPlainOldObject(sourceVal) ?
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
