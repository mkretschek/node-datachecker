/**
 * This module defines methods for loading formats from format files.
 */

'use strict';

var
  _ = require('underscore'),
  fs = require('fs'),
  NATIVE_TYPES = require('./nativetypes'),
  utils = require('./utils'),
  formats,
  format;


// Makes `require()` parse YAML files
require('js-yaml');


function loadFormatFile(file) {
  return require(file);
}


function loadFormatDir(dir) {
  var
    formats = {},
    files = fs.readdirSync(dir),
    file,
    stats,
    len,
    i;

  for (i = 0, len = files.length; i < len; i += 1) {
    file = files[i];
    stats = fs.statSync(file);

    utils.deepExtend(
      formats,
      stats.isDirectory() ?
        loadFormatDir(file) :
        loadFormatFile(file)
    );
  }

  return formats;
}


function loadFormats(path) {
  // This is supposed to be called as a step of the initialization process,
  // and the application should not work while the format files have not
  // been loaded. Therefore, we use the Sync version of `fs` methods.

  var
    formats,
    stats;

  if (Array.isArray(path)) {
    formats = {};

    _.each(path, function (val) {
      utils.deepExtend(formats, loadFormats(val));
    });
  } else {
    stats = fs.statSync(path);

    formats = stats.isDirectory() ?
      loadFormatDir(path) :
      loadFormatFile(path);
  }

  return simplifyFormats(formats);
}



function simplifyFormats(formats) {
  var
    simplified = {},
    type,
    format;


  function simplify(format) {
    var
      simplified,
      key;

    if (utils.isNativeType(format.type)) {
      simplified = utils.deepCopy(format);
    } else {
      simplified = {};
      utils.deepExtend(simplified, simplify(formats[format.type]), format);
    }

    if (simplified.properties) {
      for (key in simplified.properties) {
        if (simplified.properties.hasOwnProperty(key)) {
          simplified.properties[key] = simplify(simplified.properties[key]);
        }
      }
    }

    return simplified;
  }


  for (type in formats) {
    if (formats.hasOwnProperty(type)) {
      simplified[type] = simplify(formats[type]);
    }
  }

  return simplified;
}



module.exports = loadFormats;

