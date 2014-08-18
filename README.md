node-resolve-recurse
====================

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
  "version": "0.0.1",
  "dependencies": [
    {
      "name": "test-submodule-1",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-1",
      "version": "0.0.1",
      "dependencies": []
    }, {
      "name": "test-submodule-2",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-2",
      "version": "1.2.3",
      "dependencies": []
    }, {
      "name": "test-submodule-3",
      "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-submodule-3",
      "version": "4.7.9",
      "dependencies": [
        {
          "name": "test-sub-submodule",
          "path": "/proj/node-resolve-recurse/test/test-module/node_modules/test-sub-submodule",
          "version": "0.0.3",
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
  - defaults to `module.filename`
* `filter` - `Function(name, version) | String`
  - Determine whether or not to resolve a dependency.
  - If this is a String, it will resolve dependencies that start with this string.
  - If this is a Function, it will be called with the `name` and `version` of each dependency, and is expected to return `true` to continue resolving, or `false` to ignore it.
  - Defaults to `null` (no filter)
