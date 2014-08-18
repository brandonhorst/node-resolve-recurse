var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var pkg = require('../package.json')
var resolve = require('../lib/resolve');

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

  it('filters dependencies of a given module', function(done) {
    var options = {
      path: './test-module',
      filter: function (pkg) {
        return pkg.name === 'test-module' || pkg.name === 'test-submodule-1';
      }
    }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.dependencies).to.deep.equal(depGraph.dependencies.slice(0, 1}));

      done();
    });
  });
});