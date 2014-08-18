var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var pkg = require('../package.json')
var resolve = require('../lib/resolve');
 
describe('resolve-recurse', function() {
  it('gets the path and version of the calling module', function(done) {
    resolve(function(err, module) {
      expect(err).to.not.exist;

      expect(module.path).to.equal(path.dirname(__dirname));
      expect(module.version).to.equal(pkg.version);
      done();
    });
  });

  it('gets the path and version of the provided module', function(done) {
    var options = { path: './test-module' }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;

      expect(module.path).to.equal(path.join(__dirname, 'test-module'));
      expect(module.version).to.equal('0.0.1');
      done();
    });
  });

  it('gets dependencies and versions of a given module', function(done) {
    var options = { path: './test-module' }

    resolve(options, function(err, module) {
      expect(err).to.not.exist;
      console.log(module);

      expect(module.dependencies).to.deep.have.members([
        {
          name: 'test-submodule-1',
          path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-1'),
          version: '0.0.1',
          dependencies: []
        }, {
          name: 'test-submodule-2',
          path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-2'),
          version: '1.2.3',
          dependencies: []
        }, {
          name: 'test-submodule-3',
          path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-3'),
          version: '4.7.9',
          dependencies: [
            {
              name: 'test-sub-submodule',
              path: path.join(__dirname, 'test-module', 'node_modules', 'test-submodule-3', 'node_modules', 'test-sub-submodule'),
              version: '0.0.3',
              dependencies: []
            }
          ]
        }
      ]);

      done();
    });
  });
});