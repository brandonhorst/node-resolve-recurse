node-resolve-recurse
====================

[![Build Status](https://travis-ci.org/brandonhorst/node-resolve-recurse.svg?branch=master)](https://travis-ci.org/brandonhorst/node-resolve-recurse)
[![Coverage Status](https://coveralls.io/repos/brandonhorst/node-resolve-recurse/badge.png?branch=master)](https://coveralls.io/r/brandonhorst/node-resolve-recurse?branch=master)

Recursively resolve the paths of dependent node packages

Given the directory of a module (including the current module), generate a object with the names, versions, and paths of all modules that this module depends on, recursively.

##Installation

```bash
npm install resolve-recurse
```

##Usage

```javascript
var resolve = require('resolve-recurse');
resolve(options, function(err, dependencies) {
  console.log(dependencies);
});
```

`options` is an Object containing up to 3 properties, outlined below.

If you do not pass `options` to `resolve`, it will simply assume all default options.

`resolve` will pass an object to the callback function in the form:

```json
{
  "name": "test-module",
  "path": "/proj/node-resolve-recurse/test/test-module",
  "allowedVersion": "^0.0.1",
  "actualVersion": "0.0.1",
  "dependencies": [
    {
      "name": "test-submodule-1",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-1",
      "allowedVersion": "^0.0.1",
      "actualVersion": "0.0.1",
      "dependencies": []
    }, {
      "name": "test-submodule-2",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-2",
      "allowedVersion": "^1.2.3",
      "actualVersion": "1.2.3",
      "dependencies": []
    }, {
      "name": "test-submodule-3",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-3",
      "allowedVersion": "^4.7.9",
      "actualVersion": "4.7.9",
      "dependencies": [
        {
          "name": "test-sub-submodule",
          "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-sub-submodule",
          "allowedVersion": "^0.0.3",
          "actualVersion": "0.0.3",
          "dependencies": []
        }
      ]
    }
  ]
}
```

###Options

* `properties` - `[String]`
  - Properties in the `package.json` to look for dependencies.
  - defaults to `['dependencies']`
* `path` - `String`
  - Path to an npm module to start searching for dependencies.
  - defaults to `__filename`
* `relative` - `String`
  - Path to the file that `path` should be resolved relative to. Useful if you are writing a library making use of `resolve-recurse`.
  - Only used if `path` is specified.
  - defaults to `__filename`
* `filter` - `Function(pkg)`
  - Determine whether or not to resolve a dependency.
  - If this is a Function, it will be called with `pkg`, an object representation of the package.json file of each dependency, and is expected to return `true` to continue resolving, or `false` to ignore it.
  - Defaults to `null` (no filter)
