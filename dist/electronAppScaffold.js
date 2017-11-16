'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _skeletonDependencies = require('./skeletonDependencies');

var _skeletonDependencies2 = _interopRequireDefault(_skeletonDependencies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var join = _path2.default.join;

_shelljs2.default.config.fatal = true;

/**
 * Represents the .desktop dir scaffold.
 */

var ElectronAppScaffold = function () {

    /**
     * @param {MeteorDesktop} $ - context
     * @constructor
     */
    function ElectronAppScaffold($) {
        (0, _classCallCheck3.default)(this, ElectronAppScaffold);

        this.log = new _log2.default('electronAppScaffold');
        this.$ = $;

        this.packageJson = {
            name: 'MyMeteorApp',
            main: this.$.env.isProductionBuild() ? 'app.asar/index.js' : 'app/index.js',
            dependencies: (0, _assign2.default)({}, _skeletonDependencies2.default)
        };

        if (!this.$.env.isProductionBuild()) {
            this.packageJson.dependencies.devtron = '1.4.0';
            this.packageJson.dependencies['electron-debug'] = '1.1.0';
        }
    }

    /**
     * Just a public getter from the default package.json object.
     * @returns {Object}
     */


    (0, _createClass3.default)(ElectronAppScaffold, [{
        key: 'getDefaultPackageJson',
        value: function getDefaultPackageJson() {
            return (0, _assign2.default)({}, this.packageJson);
        }

        /**
         * Clear the electron app. Removes everything except the node_modules which would be a waste
         * to delete. Later `npm prune` will keep it clear.
         */

    }, {
        key: 'clear',
        value: function clear() {
            if (!this.$.utils.exists(this.$.env.paths.electronApp.root)) {
                this.log.verbose('creating ' + this.$.env.paths.electronApp.rootName);
                _shelljs2.default.mkdir(this.$.env.paths.electronApp.root);
            }

            return (0, _del2.default)(['' + this.$.env.paths.electronApp.root + _path2.default.sep + '*', '!' + this.$.env.paths.electronApp.nodeModules]);
        }

        /**
         * Just copies the Skeleton App into the electron app.
         */

    }, {
        key: 'copySkeletonApp',
        value: function copySkeletonApp() {
            this.log.verbose('copying skeleton app');
            try {
                _shelljs2.default.cp('-rf', join(this.$.env.paths.meteorDesktop.skeleton, '*'), this.$.env.paths.electronApp.appRoot + _path2.default.sep);
            } catch (e) {
                this.log.error('error while copying skeleton app:', e);
                process.exit(1);
            }
        }

        /**
         * After clearing the electron app path, copies a fresh skeleton.
         */

    }, {
        key: 'make',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;

                                this.log.verbose('clearing ' + this.$.env.paths.electronApp.rootName);
                                _context.next = 4;
                                return this.clear();

                            case 4:
                                _context.next = 10;
                                break;

                            case 6:
                                _context.prev = 6;
                                _context.t0 = _context['catch'](0);

                                this.log.error('error while removing ' + this.$.env.paths.electronApp.root + ': ', _context.t0);
                                process.exit(1);

                            case 10:

                                this.createAppRoot();

                                this.copySkeletonApp();

                                // TODO: hey, wait, .gitignore is not needed - right?
                                /*
                                this.log.debug('creating .gitignore');
                                fs.writeFileSync(this.$.env.paths.electronApp.gitIgnore, [
                                    'node_modules'
                                ].join('\n'));
                                */
                                this.log.verbose('writing package.json');
                                _fs2.default.writeFileSync(this.$.env.paths.electronApp.packageJson, (0, _stringify2.default)(this.packageJson, null, 2));

                            case 14:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 6]]);
            }));

            function make() {
                return _ref.apply(this, arguments);
            }

            return make;
        }()

        /**
         * Creates the app directory in the electron app.
         */

    }, {
        key: 'createAppRoot',
        value: function createAppRoot() {
            try {
                this.log.verbose('creating ' + this.$.env.paths.electronApp.appRoot);
                _fs2.default.mkdirSync(this.$.env.paths.electronApp.appRoot);
            } catch (e) {
                if (e.code !== 'EEXIST') {
                    this.log.error('error while creating dir: ' + this.$.env.paths.electronApp.appRoot + ': ', e);
                    process.exit(1);
                }
            }
        }
    }]);
    return ElectronAppScaffold;
}();

exports.default = ElectronAppScaffold;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkFwcFNjYWZmb2xkLmpzIl0sIm5hbWVzIjpbImpvaW4iLCJjb25maWciLCJmYXRhbCIsIkVsZWN0cm9uQXBwU2NhZmZvbGQiLCIkIiwibG9nIiwicGFja2FnZUpzb24iLCJuYW1lIiwibWFpbiIsImVudiIsImlzUHJvZHVjdGlvbkJ1aWxkIiwiZGVwZW5kZW5jaWVzIiwiZGV2dHJvbiIsInV0aWxzIiwiZXhpc3RzIiwicGF0aHMiLCJlbGVjdHJvbkFwcCIsInJvb3QiLCJ2ZXJib3NlIiwicm9vdE5hbWUiLCJta2RpciIsInNlcCIsIm5vZGVNb2R1bGVzIiwiY3AiLCJtZXRlb3JEZXNrdG9wIiwic2tlbGV0b24iLCJhcHBSb290IiwiZSIsImVycm9yIiwicHJvY2VzcyIsImV4aXQiLCJjbGVhciIsImNyZWF0ZUFwcFJvb3QiLCJjb3B5U2tlbGV0b25BcHAiLCJ3cml0ZUZpbGVTeW5jIiwibWtkaXJTeW5jIiwiY29kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7SUFFUUEsSSxrQkFBQUEsSTs7QUFDUixrQkFBTUMsTUFBTixDQUFhQyxLQUFiLEdBQXFCLElBQXJCOztBQUVBOzs7O0lBR3FCQyxtQjs7QUFFakI7Ozs7QUFJQSxpQ0FBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsYUFBS0MsR0FBTCxHQUFXLGtCQUFRLHFCQUFSLENBQVg7QUFDQSxhQUFLRCxDQUFMLEdBQVNBLENBQVQ7O0FBRUEsYUFBS0UsV0FBTCxHQUFtQjtBQUNmQyxrQkFBTSxhQURTO0FBRWZDLGtCQUFPLEtBQUtKLENBQUwsQ0FBT0ssR0FBUCxDQUFXQyxpQkFBWCxFQUFELEdBQ0YsbUJBREUsR0FDb0IsY0FIWDtBQUlmQywwQkFBYyxzQkFBYyxFQUFkO0FBSkMsU0FBbkI7O0FBT0EsWUFBSSxDQUFDLEtBQUtQLENBQUwsQ0FBT0ssR0FBUCxDQUFXQyxpQkFBWCxFQUFMLEVBQXFDO0FBQ2pDLGlCQUFLSixXQUFMLENBQWlCSyxZQUFqQixDQUE4QkMsT0FBOUIsR0FBd0MsT0FBeEM7QUFDQSxpQkFBS04sV0FBTCxDQUFpQkssWUFBakIsQ0FBOEIsZ0JBQTlCLElBQWtELE9BQWxEO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs7Z0RBSXdCO0FBQ3BCLG1CQUFPLHNCQUFjLEVBQWQsRUFBa0IsS0FBS0wsV0FBdkIsQ0FBUDtBQUNIOztBQUVEOzs7Ozs7O2dDQUlRO0FBQ0osZ0JBQUksQ0FBQyxLQUFLRixDQUFMLENBQU9TLEtBQVAsQ0FBYUMsTUFBYixDQUFvQixLQUFLVixDQUFMLENBQU9LLEdBQVAsQ0FBV00sS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJDLElBQWpELENBQUwsRUFBNkQ7QUFDekQscUJBQUtaLEdBQUwsQ0FBU2EsT0FBVCxlQUE2QixLQUFLZCxDQUFMLENBQU9LLEdBQVAsQ0FBV00sS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJHLFFBQTFEO0FBQ0Esa0NBQU1DLEtBQU4sQ0FBWSxLQUFLaEIsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCQyxJQUF6QztBQUNIOztBQUVELG1CQUFPLG1CQUFJLE1BQ0osS0FBS2IsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCQyxJQUR6QixHQUNnQyxlQUFLSSxHQURyQyxjQUVILEtBQUtqQixDQUFMLENBQU9LLEdBQVAsQ0FBV00sS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJNLFdBRjFCLENBQUosQ0FBUDtBQUlIOztBQUVEOzs7Ozs7MENBR2tCO0FBQ2QsaUJBQUtqQixHQUFMLENBQVNhLE9BQVQsQ0FBaUIsc0JBQWpCO0FBQ0EsZ0JBQUk7QUFDQSxrQ0FBTUssRUFBTixDQUNJLEtBREosRUFFSXZCLEtBQUssS0FBS0ksQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJTLGFBQWpCLENBQStCQyxRQUFwQyxFQUE4QyxHQUE5QyxDQUZKLEVBR0ksS0FBS3JCLENBQUwsQ0FBT0ssR0FBUCxDQUFXTSxLQUFYLENBQWlCQyxXQUFqQixDQUE2QlUsT0FBN0IsR0FBdUMsZUFBS0wsR0FIaEQ7QUFLSCxhQU5ELENBTUUsT0FBT00sQ0FBUCxFQUFVO0FBQ1IscUJBQUt0QixHQUFMLENBQVN1QixLQUFULENBQWUsbUNBQWYsRUFBb0RELENBQXBEO0FBQ0FFLHdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0FBS1EscUNBQUt6QixHQUFMLENBQVNhLE9BQVQsZUFBNkIsS0FBS2QsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCRyxRQUExRDs7dUNBQ00sS0FBS1ksS0FBTCxFOzs7Ozs7Ozs7O0FBRU4scUNBQUsxQixHQUFMLENBQVN1QixLQUFULDJCQUM0QixLQUFLeEIsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCQyxJQUR6RDtBQUVBWSx3Q0FBUUMsSUFBUixDQUFhLENBQWI7Ozs7QUFHSixxQ0FBS0UsYUFBTDs7QUFFQSxxQ0FBS0MsZUFBTDs7QUFFQTtBQUNBOzs7Ozs7QUFNQSxxQ0FBSzVCLEdBQUwsQ0FBU2EsT0FBVCxDQUFpQixzQkFBakI7QUFDQSw2Q0FBR2dCLGFBQUgsQ0FDSSxLQUFLOUIsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCVixXQURqQyxFQUM4Qyx5QkFBZSxLQUFLQSxXQUFwQixFQUFpQyxJQUFqQyxFQUF1QyxDQUF2QyxDQUQ5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLSjs7Ozs7O3dDQUdnQjtBQUNaLGdCQUFJO0FBQ0EscUJBQUtELEdBQUwsQ0FBU2EsT0FBVCxlQUE2QixLQUFLZCxDQUFMLENBQU9LLEdBQVAsQ0FBV00sS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJVLE9BQTFEO0FBQ0EsNkJBQUdTLFNBQUgsQ0FBYSxLQUFLL0IsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCVSxPQUExQztBQUNILGFBSEQsQ0FHRSxPQUFPQyxDQUFQLEVBQVU7QUFDUixvQkFBSUEsRUFBRVMsSUFBRixLQUFXLFFBQWYsRUFBeUI7QUFDckIseUJBQUsvQixHQUFMLENBQVN1QixLQUFULGdDQUNpQyxLQUFLeEIsQ0FBTCxDQUFPSyxHQUFQLENBQVdNLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCVSxPQUQ5RCxTQUMyRUMsQ0FEM0U7QUFFQUUsNEJBQVFDLElBQVIsQ0FBYSxDQUFiO0FBQ0g7QUFDSjtBQUNKOzs7OztrQkE1R2dCM0IsbUIiLCJmaWxlIjoiZWxlY3Ryb25BcHBTY2FmZm9sZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZGVsIGZyb20gJ2RlbCc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgZGVwZW5kZW5jaWVzIGZyb20gJy4vc2tlbGV0b25EZXBlbmRlbmNpZXMnO1xuXG5jb25zdCB7IGpvaW4gfSA9IHBhdGg7XG5zaGVsbC5jb25maWcuZmF0YWwgPSB0cnVlO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIC5kZXNrdG9wIGRpciBzY2FmZm9sZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlY3Ryb25BcHBTY2FmZm9sZCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgLSBjb250ZXh0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2VsZWN0cm9uQXBwU2NhZmZvbGQnKTtcbiAgICAgICAgdGhpcy4kID0gJDtcblxuICAgICAgICB0aGlzLnBhY2thZ2VKc29uID0ge1xuICAgICAgICAgICAgbmFtZTogJ015TWV0ZW9yQXBwJyxcbiAgICAgICAgICAgIG1haW46ICh0aGlzLiQuZW52LmlzUHJvZHVjdGlvbkJ1aWxkKCkpID9cbiAgICAgICAgICAgICAgICAnYXBwLmFzYXIvaW5kZXguanMnIDogJ2FwcC9pbmRleC5qcycsXG4gICAgICAgICAgICBkZXBlbmRlbmNpZXM6IE9iamVjdC5hc3NpZ24oe30sIGRlcGVuZGVuY2llcylcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIXRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkge1xuICAgICAgICAgICAgdGhpcy5wYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMuZGV2dHJvbiA9ICcxLjQuMCc7XG4gICAgICAgICAgICB0aGlzLnBhY2thZ2VKc29uLmRlcGVuZGVuY2llc1snZWxlY3Ryb24tZGVidWcnXSA9ICcxLjEuMCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdXN0IGEgcHVibGljIGdldHRlciBmcm9tIHRoZSBkZWZhdWx0IHBhY2thZ2UuanNvbiBvYmplY3QuXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXREZWZhdWx0UGFja2FnZUpzb24oKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBhY2thZ2VKc29uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgZWxlY3Ryb24gYXBwLiBSZW1vdmVzIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBub2RlX21vZHVsZXMgd2hpY2ggd291bGQgYmUgYSB3YXN0ZVxuICAgICAqIHRvIGRlbGV0ZS4gTGF0ZXIgYG5wbSBwcnVuZWAgd2lsbCBrZWVwIGl0IGNsZWFyLlxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICBpZiAoIXRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290KSkge1xuICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZShgY3JlYXRpbmcgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lfWApO1xuICAgICAgICAgICAgc2hlbGwubWtkaXIodGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWwoW1xuICAgICAgICAgICAgYCR7dGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290fSR7cGF0aC5zZXB9KmAsXG4gICAgICAgICAgICBgISR7dGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlc31gXG4gICAgICAgIF0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1c3QgY29waWVzIHRoZSBTa2VsZXRvbiBBcHAgaW50byB0aGUgZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIGNvcHlTa2VsZXRvbkFwcCgpIHtcbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnY29weWluZyBza2VsZXRvbiBhcHAnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNoZWxsLmNwKFxuICAgICAgICAgICAgICAgICctcmYnLFxuICAgICAgICAgICAgICAgIGpvaW4odGhpcy4kLmVudi5wYXRocy5tZXRlb3JEZXNrdG9wLnNrZWxldG9uLCAnKicpLFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCArIHBhdGguc2VwXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY29weWluZyBza2VsZXRvbiBhcHA6JywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZnRlciBjbGVhcmluZyB0aGUgZWxlY3Ryb24gYXBwIHBhdGgsIGNvcGllcyBhIGZyZXNoIHNrZWxldG9uLlxuICAgICAqL1xuICAgIGFzeW5jIG1ha2UoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBjbGVhcmluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdE5hbWV9YCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgIGBlcnJvciB3aGlsZSByZW1vdmluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdH06IGAsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmVhdGVBcHBSb290KCk7XG5cbiAgICAgICAgdGhpcy5jb3B5U2tlbGV0b25BcHAoKTtcblxuICAgICAgICAvLyBUT0RPOiBoZXksIHdhaXQsIC5naXRpZ25vcmUgaXMgbm90IG5lZWRlZCAtIHJpZ2h0P1xuICAgICAgICAvKlxuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnY3JlYXRpbmcgLmdpdGlnbm9yZScpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZ2l0SWdub3JlLCBbXG4gICAgICAgICAgICAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICBdLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnd3JpdGluZyBwYWNrYWdlLmpzb24nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucGFja2FnZUpzb24sIEpTT04uc3RyaW5naWZ5KHRoaXMucGFja2FnZUpzb24sIG51bGwsIDIpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgYXBwIGRpcmVjdG9yeSBpbiB0aGUgZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIGNyZWF0ZUFwcFJvb3QoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBjcmVhdGluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdH1gKTtcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgZXJyb3Igd2hpbGUgY3JlYXRpbmcgZGlyOiAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdH06IGAsIGUpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==