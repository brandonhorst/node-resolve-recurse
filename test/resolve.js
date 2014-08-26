var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var pkg = require('../package.json')
var resolve = require('../lib/resolve');

chai.use(require("chai-as-promised"));

var depGraph = {
  name: 'test-module',
  path: path.join(__dirname, 'test-module'),
  allowedVersion: null,
  actualVersion: '0.0.9',
  dependencies: [
    {
      name: 'test-submodule-1',
      path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-1'),
      allowedVersion: '^0.0.1',
      actualVersion: '0.0.1',
      dependencies: []
    }, {
      name: 'test-submodule-2',
      path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-2'),
      allowedVersion: '^1.2.3',
      actualVersion: '1.2.3',
      dependencies: []
    }, {
      name: 'test-submodule-3',
      path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-3'),
      allowedVersion: '^4.7.9',
      actualVersion: '4.7.9',
      dependencies: [
        {
          name: 'test-sub-submodule',
          path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-3', 'node_modules', 'test-sub-submodule'),
          allowedVersion: '^0.0.3',
          actualVersion: '0.0.3',
          dependencies: []
        }
      ]
    }
  ]
}
 
describe('resolve-recurse', function() {
  it('gets the path and version of the calling module', function(done) {
    resolve(function(err, module) {
      expect(err).to.not.exist;

      expect(module.path).to.equal(path.dirname(__dirname));
      expect(module.actualVersion).to.equal(pkg.version);
      done();
    });
  });

  it('returns a promise', function() {
    return expect(resolve()).to.eventually.have.property('name');
  });


  it('gets the path and version of the provided module', function(done) {
    var options = { path: './test-module' }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.path).to.equal(path.join(__dirname, 'test-module'));
      expect(module.actualVersion).to.equal('0.0.9');
      expect(module.allowedVersion).to.be.null;
      done();
    });
  });


  it('gets dependencies of a given module', function(done) {
    var options = { path: './test-module' }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.dependencies).to.deep.have.members(depGraph.dependencies);

      done();
    });
  });

  it('gets dependencies of a given module relative to another file', function(done) {
    var options = {
      path: 'test-submodule-1',
      relative: path.join(__dirname, 'test-module', 'index.js')
    };

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(_.omit(module, 'allowedVersion')).to.deep.equal(_.omit(depGraph.dependencies[0], 'allowedVersion'));
      expect(module.allowedVersion).to.be.null;

      done();
    });
  });


  it('filters dependencies of a given module', function(done) {
    var options = {
      path: './test-module',
      filter: function (pkg) {
        return pkg.name === 'test-module' || pkg.name === 'test-submodule-1';
      }
    }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.dependencies).to.deep.equal([depGraph.dependencies[0]]);

      done();
    });
  });


  it('gets dependencies from a different property', function(done) {
    var options = {
      path: './test-module',
      properties: ['someOtherDependencies']
    }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.dependencies).to.deep.equal([depGraph.dependencies[1]]);

      done();
    });
  });
});