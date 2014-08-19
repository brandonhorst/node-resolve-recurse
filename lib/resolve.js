//resolve.js

var Promise = require('promise');
var findup = Promise.denodeify(require('findup'));
var resolve = Promise.denodeify(require('resolve'));

var _ = require('lodash');
var path = require('path');

//promise moduleDirectory
// given the name of a module, and the directory of the module which referenced
//  it, resolve to the module base directory
function moduleDirectory(name, dir) {
  return resolve(name, {basedir: dir}).then(function (filePath) {
    return findup(path.dirname(filePath), 'package.json');
  });
}

//promise mergeDefaultOptions
// given use-input options, it will resolve an options object
//  with the defaults in place, and options.path resolved
function mergeDefaultOptions(options) {
  return new Promise(function (fulfill, reject) {

    //apply simple defaults
    var trueOptions = {
      filter: options.filter || null,
      properties: options.properties || ['dependencies']
    };

    //if options.path was supplied, resolve it relative to the parent.
    // if not, just use the parent itself
    Promise.resolve(options.path
      ? moduleDirectory(options.path, path.dirname(module.parent.filename))
      : moduleDirectory(module.parent.filename, '.'))
    .then(function (modulePath) {
      trueOptions.path = modulePath;
      fulfill(trueOptions);
    }).catch(reject);
  });
}

//function unzipObject
// given an accumulator (an array) and an object, break the object into many
// [key, value] arrays and add them to acc
// return acc
// for use with _.reduce
function unzipObject(acc, value) {
  _.each(value, function(value, key) {
    acc.push({name: key, version: value});
  });
  return acc;
}

//function getDependencies
// given a package.json file read into an object, return the dependencies
// as specified in options.dependencies
function getDependencies(pkg, options) {
  return _.chain(pkg)
    .at(options.properties)
    .reduce(unzipObject, [])
    .value();
}


//promise dependentModules
function dependentModules(dir, allowedVersion, options) {
  return new Promise(function (fulfill, reject) {

    //read the package.json, and get the dependencies
    var pkg = require(path.join(dir, 'package.json'));
    var deps = getDependencies(pkg, options);
    var depPromises;

    //if there is a filter, and it rejects this package.json, just stop
    if (options.filter && !options.filter(pkg)) {
      fulfill();
      return;
    }

    //for each dependency, make a promise that calls dependentModules
    // on its directory
    depPromises = _.map(deps, function(dep) {
      return moduleDirectory(dep.name, dir).then(function (directory) {
        return dependentModules(directory, dep.version, options);
      });
    });

    //resolve all of those promises, and stick the array into the object
    //call _.compact because filtered-out dependencies return null
    Promise.all(depPromises).then(function (depObjects) {
      fulfill({
        name: pkg.name,
        path: dir,
        allowedVersion: allowedVersion,
        actualVersion: pkg.version,
        dependencies: _.compact(depObjects)
      });
    }).catch(reject);
  });
}

//function resolveRecurse
// entry point
// get the default options, and then get the dependent modules (recursively)
function resolveRecurse(options, done) {

  //if only one argument was passed, and it's a function, then it's a callback
  // and the user wants the default options
  if (!done && typeof options === 'function') {
    done = options;
    options = {};
  }

  //get the default options, and then get the dependent modules
  //nodify it, to conform to a typical node API but still return a promise
  return mergeDefaultOptions(options).then(function(options) {
    return dependentModules(options.path, null, options);
  }).nodeify(done);
}

module.exports = resolveRecurse;