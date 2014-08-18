//resolve.js

var _ = require('lodash');
var async = require('async');
var findup = require('findup');
var path = require('path');
var semver = require('semver');
var resolver = new (require('async-resolve'))();

//function getModuleDirFromFile
// given the path of a file in a module, pass the path of the module to done
function getModuleDirFromFile(filePath, done) {
  findup(path.dirname(filePath), 'package.json', function(err, packagePath) {
    if (err) {
      done(err);
    } else {
      done(null, packagePath);
    }
  });
}

//function resolveDirectoryForName
// given a name (either a module name or a path), and the directory
// of the module which is calling that path, pass the path of the referred
// module to done
function resolveDirectoryForName(name, dir, done) {
  resolver.resolve(name, dir, function (err, mainFilePath) {
    if (err) {
      done(err);
    } else {
      getModuleDirFromFile(mainFilePath, done);
    }
  });
}

//function resolve
// takes the options, adds the defaults, and just passes it on
// to resolveRecurse
function resolve(options, done) {
  var trueOptions;
  var pathAccessor;

  //function resolveProvidedPath
  // resolve the provided path in the context of the module that require'd
  // resolve-recurse
  function resolveProvidedPath(done) {
    resolveDirectoryForName(options.path, path.dirname(module.parent.filename), function(err, packageDir) {
      if (err) {
        done(err);
      } else {
        done(null, packageDir);
      }
    });
  }

  //function handlePath
  // given the path of the module, start resolveRecurse with that module
  // as the path
  function handlePath(err, moduleDir) {
    if (err) {
      done(err);
    } else {
      trueOptions.path = moduleDir;
      resolveRecurse(trueOptions.path, null, done);
    }
  }


  //function resolveRecurse
  // given a module directory,
  // find all of its dependencies, and call resolveRecurse on them
  // call call done with this package and all dependencies
  function resolveRecurse(dir, allowedVersion, done) {
    var pkg = require(path.join(dir, '/package.json'));
    var dependencies = getDependencies(pkg, trueOptions);
    var depObjects = [];

    //function eachDependency
    // given a dependency (name/version object),
    // call resolveRecurse to resolve it recursively,
    // then add it to the depObjects array
    function eachDependency(item, done) {

      //function addObjectToDeps
      // given a dependency (name/version/dependencies object),
      // add it to depObjects
      function addObjectToDeps(err, resolvedObj) {
        if (err) {
          done(err);
        } else {
          depObjects.push(resolvedObj);
          done();
        }
      }

      resolveDirectoryForName(item.name, dir, function(err, packagePath) {
        if (err) {
          done(err);
        } else {
          resolveRecurse(packagePath, item.version, addObjectToDeps);
        }
      });
    }

    //function returnObject
    // package up depObjects with name and version, and pass it to done
    function returnObject(err) {
      var resolveObject;

      if (err) {
        done(err);
      } else {
        resolveObject = {
          name: pkg.name,
          path: dir,
          allowedVersion: allowedVersion,
          actualVersion: pkg.version,
          dependencies: depObjects
        };
        done(null, resolveObject);
      }
    }

    async.each(dependencies, eachDependency, returnObject);
  }


  //If they only passed the callback, just accept that with default settings
  if (_.isFunction(options) && !done) {
    done = options;
    options = {};
  }

  trueOptions = {
    properties: options.properties || ['dependencies'],
    filter: options.filter || null
  };

  pathAccessor = options.path ? resolveProvidedPath : getThisModuleDir;
  
  pathAccessor(handlePath);
}


//function getThisModuleDir
// get the directory path of the module that required this module
// pass it to done
function getThisModuleDir(done) {
  getModuleDirFromFile(module.parent.filename, done);
}

//function getDependencies
// given a package.json file read into an object, return the dependencies
// as specified in options.dependencies
function getDependencies(pkg, options) {

  //function filterFunction
  // return true or false if option.filter will accept version and module
  function filterFunction(version, module) {
    //if no filter is provided, do everything
    if (_.isNull(options.filter)) {
      return true;

    //call a callback function
    } else if (_.isFunction(options.filter)) {
      return options.filter(module, semver.clean(version));

    //check to see if the package starts with the filter
    } else {
      return module.indexOf(options.filter) === 0;
    }
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

  return _.chain(pkg)
    .at(options.properties)
    .reduce(unzipObject, [])
    .filter(filterFunction)
    .value();
}

module.exports = resolve;
