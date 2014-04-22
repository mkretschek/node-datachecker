/**
 * Methods for loading formats from format files.
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


/**
 * Loads the given format file.
 * @param {String} file Path to the format file.
 * @return {Object} The parsed format object.
 */
function loadFormatFile(file) {
  return require(file);
}


/**
 * Loads all format files in the given dir.
 * @param {String} dir Path to the dir containing the format files.
 * @return {Object} The parsed format object.
 */
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


/**
 * Simplifies the format objects joining custom types until all formats
 * use native javascript types, avoiding the overhead of doing the join on each
 * check.
 * @param {Object} formats A complete format object as returned from
 *  {@code loadFormats()}.
 * @return {Object} A simplified format object.
 */
function simplifyFormats(formats) {
  var
    simplified = {},
    type,
    format;

  /**
   * Simplifies a specific format definition, resolving custom types into native
   * javascript types, merging specifications into a single object and expanding
   * property formats.
   * @param {Object} format The specific format to simplify.
   * @return {Object} The simplified format.
   */
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


/**
 * Loads all formats from the given path (or array of paths).
 * @param {(String|Array.<String>)} path Path or array of paths to files
 *  containing format definitions.
 * @return {Object} A simplified format object.
 */
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


module.exports = loadFormats;

