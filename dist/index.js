'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _env = require('./env');

var _env2 = _interopRequireDefault(_env);

var _electron = require('./electron');

var _electron2 = _interopRequireDefault(_electron);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _desktop = require('./desktop');

var _desktop2 = _interopRequireDefault(_desktop);

var _electronApp = require('./electronApp');

var _electronApp2 = _interopRequireDefault(_electronApp);

var _meteorApp = require('./meteorApp');

var _meteorApp2 = _interopRequireDefault(_meteorApp);

var _electronBuilder = require('./electronBuilder');

var _electronBuilder2 = _interopRequireDefault(_electronBuilder);

var _packager = require('./packager');

var _packager2 = _interopRequireDefault(_packager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_shelljs2.default.config.fatal = true;

/**
 * Exists
 * @param {string} pathToCheck
 * @returns {boolean}
 */
function exists(pathToCheck) {
    try {
        _fs2.default.accessSync(pathToCheck);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Simple wrapper for shelljs.rm with additional retries in case of failure.
 * It is useful when something is concurrently reading the dir you want to remove.
 */
function rmWithRetries() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var retries = 0;
    return new _promise2.default(function (resolve, reject) {
        function rm() {
            for (var _len2 = arguments.length, rmArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                rmArgs[_key2] = arguments[_key2];
            }

            try {
                _shelljs2.default.rm.apply(_shelljs2.default, rmArgs);
                resolve();
            } catch (e) {
                retries += 1;
                if (retries < 5) {
                    setTimeout(function () {
                        rm.apply(undefined, rmArgs);
                    }, 100);
                } else {
                    reject(e);
                }
            }
        }
        rm.apply(undefined, args);
    });
}

/**
 * Main entity.
 * @class
 * @property {Env} env
 * @property {Electron} electron
 * @property {InstallerBuilder} installerBuilder
 * @property {ElectronApp} electronApp
 * @property {Desktop} desktop
 * @property {MeteorApp} meteorApp
 */

var MeteorDesktop = function () {

    /**
     * @param {string} input        - Meteor app dir
     * @param {string} output       - output dir for bundle/package/installer
     * @param {Object} options      - options from cli.js
     * @param {Object} dependencies - dependencies object
     * @constructor
     */
    function MeteorDesktop(input, output, options, dependencies) {
        (0, _classCallCheck3.default)(this, MeteorDesktop);

        var Log = dependencies.log;
        this.log = new Log('index');
        this.version = this.getVersion();

        this.log.info('initializing');

        this.env = new _env2.default(input, output, options);
        this.electron = new _electron2.default(this);
        this.electronBuilder = new _electronBuilder2.default(this);
        this.electronApp = new _electronApp2.default(this);
        this.desktop = new _desktop2.default(this);
        this.meteorApp = new _meteorApp2.default(this);
        this.packager = new _packager2.default(this);
        this.utils = {
            exists: exists,
            rmWithRetries: rmWithRetries
        };
    }

    /**
     * Tries to read the version from our own package.json.
     *
     * @returns {string}
     */


    (0, _createClass3.default)(MeteorDesktop, [{
        key: 'getVersion',
        value: function getVersion() {
            if (this.version) {
                return this.version;
            }

            var version = null;
            try {
                version = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '..', 'package.json'), 'UTF-8')).version;
            } catch (e) {
                this.log.error('error while trying to read ' + _path2.default.join(__dirname, 'package.json'), e);
                process.exit(1);
            }
            return version;
        }
    }, {
        key: 'init',
        value: function init() {
            this.desktop.scaffold();
            this.meteorApp.updateGitIgnore();
        }
    }, {
        key: 'buildInstaller',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.env.options.installerBuild = true;
                                _context.next = 3;
                                return this.electronApp.build();

                            case 3:
                                _context.prev = 3;
                                _context.next = 6;
                                return this.electronBuilder.build();

                            case 6:
                                _context.next = 11;
                                break;

                            case 8:
                                _context.prev = 8;
                                _context.t0 = _context['catch'](3);

                                this.log.error('error occurred while building installer', _context.t0);

                            case 11:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[3, 8]]);
            }));

            function buildInstaller() {
                return _ref.apply(this, arguments);
            }

            return buildInstaller;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.electronApp.build(true);

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function run() {
                return _ref2.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.electronApp.build();

                            case 2:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function build() {
                return _ref3.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'justRun',
        value: function justRun() {
            this.electron.run();
        }
    }, {
        key: 'runPackager',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var _this = this;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.electronApp.build();

                            case 2:

                                this.packager.packageApp().catch(function (e) {
                                    _this.log.error('while trying to build a package an error occurred: ' + e);
                                });

                            case 3:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function runPackager() {
                return _ref4.apply(this, arguments);
            }

            return runPackager;
        }()
    }]);
    return MeteorDesktop;
}();

function _exports(input, output, options) {
    var _ref5 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { log: _log2.default },
        _ref5$log = _ref5.log,
        log = _ref5$log === undefined ? _log2.default : _ref5$log;

    return new MeteorDesktop(input, output, options, { log: log });
}
exports.default = _exports;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJmYXRhbCIsImV4aXN0cyIsInBhdGhUb0NoZWNrIiwiYWNjZXNzU3luYyIsImUiLCJybVdpdGhSZXRyaWVzIiwiYXJncyIsInJldHJpZXMiLCJyZXNvbHZlIiwicmVqZWN0Iiwicm0iLCJybUFyZ3MiLCJzZXRUaW1lb3V0IiwiTWV0ZW9yRGVza3RvcCIsImlucHV0Iiwib3V0cHV0Iiwib3B0aW9ucyIsImRlcGVuZGVuY2llcyIsIkxvZyIsImxvZyIsInZlcnNpb24iLCJnZXRWZXJzaW9uIiwiaW5mbyIsImVudiIsImVsZWN0cm9uIiwiZWxlY3Ryb25CdWlsZGVyIiwiZWxlY3Ryb25BcHAiLCJkZXNrdG9wIiwibWV0ZW9yQXBwIiwicGFja2FnZXIiLCJ1dGlscyIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImpvaW4iLCJfX2Rpcm5hbWUiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0Iiwic2NhZmZvbGQiLCJ1cGRhdGVHaXRJZ25vcmUiLCJpbnN0YWxsZXJCdWlsZCIsImJ1aWxkIiwicnVuIiwicGFja2FnZUFwcCIsImNhdGNoIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsa0JBQU1BLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjs7QUFFQTs7Ozs7QUFLQSxTQUFTQyxNQUFULENBQWdCQyxXQUFoQixFQUE2QjtBQUN6QixRQUFJO0FBQ0EscUJBQUdDLFVBQUgsQ0FBY0QsV0FBZDtBQUNBLGVBQU8sSUFBUDtBQUNILEtBSEQsQ0FHRSxPQUFPRSxDQUFQLEVBQVU7QUFDUixlQUFPLEtBQVA7QUFDSDtBQUNKOztBQUVEOzs7O0FBSUEsU0FBU0MsYUFBVCxHQUFnQztBQUFBLHNDQUFOQyxJQUFNO0FBQU5BLFlBQU07QUFBQTs7QUFDNUIsUUFBSUMsVUFBVSxDQUFkO0FBQ0EsV0FBTyxzQkFBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDcEMsaUJBQVNDLEVBQVQsR0FBdUI7QUFBQSwrQ0FBUkMsTUFBUTtBQUFSQSxzQkFBUTtBQUFBOztBQUNuQixnQkFBSTtBQUNBLGtDQUFNRCxFQUFOLDBCQUFZQyxNQUFaO0FBQ0FIO0FBQ0gsYUFIRCxDQUdFLE9BQU9KLENBQVAsRUFBVTtBQUNSRywyQkFBVyxDQUFYO0FBQ0Esb0JBQUlBLFVBQVUsQ0FBZCxFQUFpQjtBQUNiSywrQkFBVyxZQUFNO0FBQ2JGLDRDQUFNQyxNQUFOO0FBQ0gscUJBRkQsRUFFRyxHQUZIO0FBR0gsaUJBSkQsTUFJTztBQUNIRiwyQkFBT0wsQ0FBUDtBQUNIO0FBQ0o7QUFDSjtBQUNETSw0QkFBTUosSUFBTjtBQUNILEtBakJNLENBQVA7QUFrQkg7O0FBRUQ7Ozs7Ozs7Ozs7O0lBVU1PLGE7O0FBRUY7Ozs7Ozs7QUFPQSwyQkFBWUMsS0FBWixFQUFtQkMsTUFBbkIsRUFBMkJDLE9BQTNCLEVBQW9DQyxZQUFwQyxFQUFrRDtBQUFBOztBQUM5QyxZQUFNQyxNQUFNRCxhQUFhRSxHQUF6QjtBQUNBLGFBQUtBLEdBQUwsR0FBVyxJQUFJRCxHQUFKLENBQVEsT0FBUixDQUFYO0FBQ0EsYUFBS0UsT0FBTCxHQUFlLEtBQUtDLFVBQUwsRUFBZjs7QUFFQSxhQUFLRixHQUFMLENBQVNHLElBQVQsQ0FBYyxjQUFkOztBQUVBLGFBQUtDLEdBQUwsR0FBVyxrQkFBUVQsS0FBUixFQUFlQyxNQUFmLEVBQXVCQyxPQUF2QixDQUFYO0FBQ0EsYUFBS1EsUUFBTCxHQUFnQix1QkFBYSxJQUFiLENBQWhCO0FBQ0EsYUFBS0MsZUFBTCxHQUF1Qiw4QkFBb0IsSUFBcEIsQ0FBdkI7QUFDQSxhQUFLQyxXQUFMLEdBQW1CLDBCQUFnQixJQUFoQixDQUFuQjtBQUNBLGFBQUtDLE9BQUwsR0FBZSxzQkFBWSxJQUFaLENBQWY7QUFDQSxhQUFLQyxTQUFMLEdBQWlCLHdCQUFjLElBQWQsQ0FBakI7QUFDQSxhQUFLQyxRQUFMLEdBQWdCLHVCQUFhLElBQWIsQ0FBaEI7QUFDQSxhQUFLQyxLQUFMLEdBQWE7QUFDVDdCLDBCQURTO0FBRVRJO0FBRlMsU0FBYjtBQUlIOztBQUVEOzs7Ozs7Ozs7cUNBS2E7QUFDVCxnQkFBSSxLQUFLZSxPQUFULEVBQWtCO0FBQ2QsdUJBQU8sS0FBS0EsT0FBWjtBQUNIOztBQUVELGdCQUFJQSxVQUFVLElBQWQ7QUFDQSxnQkFBSTtBQUNBQSwwQkFBVVcsS0FBS0MsS0FBTCxDQUNOLGFBQUdDLFlBQUgsQ0FBZ0IsZUFBS0MsSUFBTCxDQUFVQyxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGNBQTNCLENBQWhCLEVBQTRELE9BQTVELENBRE0sRUFFUmYsT0FGRjtBQUdILGFBSkQsQ0FJRSxPQUFPaEIsQ0FBUCxFQUFVO0FBQ1IscUJBQUtlLEdBQUwsQ0FBU2lCLEtBQVQsaUNBQTZDLGVBQUtGLElBQUwsQ0FBVUMsU0FBVixFQUFxQixjQUFyQixDQUE3QyxFQUFxRi9CLENBQXJGO0FBQ0FpQyx3QkFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDtBQUNELG1CQUFPbEIsT0FBUDtBQUNIOzs7K0JBRU07QUFDSCxpQkFBS08sT0FBTCxDQUFhWSxRQUFiO0FBQ0EsaUJBQUtYLFNBQUwsQ0FBZVksZUFBZjtBQUNIOzs7Ozs7Ozs7QUFHRyxxQ0FBS2pCLEdBQUwsQ0FBU1AsT0FBVCxDQUFpQnlCLGNBQWpCLEdBQWtDLElBQWxDOzt1Q0FDTSxLQUFLZixXQUFMLENBQWlCZ0IsS0FBakIsRTs7Ozs7dUNBRUksS0FBS2pCLGVBQUwsQ0FBcUJpQixLQUFyQixFOzs7Ozs7Ozs7O0FBRU4scUNBQUt2QixHQUFMLENBQVNpQixLQUFULENBQWUseUNBQWY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUNBS0UsS0FBS1YsV0FBTCxDQUFpQmdCLEtBQWpCLENBQXVCLElBQXZCLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUNBSUEsS0FBS2hCLFdBQUwsQ0FBaUJnQixLQUFqQixFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBR0E7QUFDTixpQkFBS2xCLFFBQUwsQ0FBY21CLEdBQWQ7QUFDSDs7Ozs7Ozs7Ozs7O3VDQUdTLEtBQUtqQixXQUFMLENBQWlCZ0IsS0FBakIsRTs7OztBQUVOLHFDQUFLYixRQUFMLENBQWNlLFVBQWQsR0FBMkJDLEtBQTNCLENBQWlDLFVBQUN6QyxDQUFELEVBQU87QUFDcEMsMENBQUtlLEdBQUwsQ0FBU2lCLEtBQVQseURBQXFFaEMsQ0FBckU7QUFDSCxpQ0FGRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNTyxTQUFTMEMsUUFBVCxDQUFpQmhDLEtBQWpCLEVBQXdCQyxNQUF4QixFQUFnQ0MsT0FBaEMsRUFBNkU7QUFBQSxvRkFBakIsRUFBRUcsa0JBQUYsRUFBaUI7QUFBQSwwQkFBbENBLEdBQWtDO0FBQUEsUUFBbENBLEdBQWtDOztBQUN4RixXQUFPLElBQUlOLGFBQUosQ0FBa0JDLEtBQWxCLEVBQXlCQyxNQUF6QixFQUFpQ0MsT0FBakMsRUFBMEMsRUFBRUcsUUFBRixFQUExQyxDQUFQO0FBQ0giLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQgRW52IGZyb20gJy4vZW52JztcbmltcG9ydCBFbGVjdHJvbiBmcm9tICcuL2VsZWN0cm9uJztcbmltcG9ydCBMb2dnZXIgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IERlc2t0b3AgZnJvbSAnLi9kZXNrdG9wJztcbmltcG9ydCBFbGVjdHJvbkFwcCBmcm9tICcuL2VsZWN0cm9uQXBwJztcbmltcG9ydCBNZXRlb3JBcHAgZnJvbSAnLi9tZXRlb3JBcHAnO1xuaW1wb3J0IEVsZWN0cm9uQnVpbGRlciBmcm9tICcuL2VsZWN0cm9uQnVpbGRlcic7XG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcic7XG5cbnNoZWxsLmNvbmZpZy5mYXRhbCA9IHRydWU7XG5cbi8qKlxuICogRXhpc3RzXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFRvQ2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBleGlzdHMocGF0aFRvQ2hlY2spIHtcbiAgICB0cnkge1xuICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGhUb0NoZWNrKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFNpbXBsZSB3cmFwcGVyIGZvciBzaGVsbGpzLnJtIHdpdGggYWRkaXRpb25hbCByZXRyaWVzIGluIGNhc2Ugb2YgZmFpbHVyZS5cbiAqIEl0IGlzIHVzZWZ1bCB3aGVuIHNvbWV0aGluZyBpcyBjb25jdXJyZW50bHkgcmVhZGluZyB0aGUgZGlyIHlvdSB3YW50IHRvIHJlbW92ZS5cbiAqL1xuZnVuY3Rpb24gcm1XaXRoUmV0cmllcyguLi5hcmdzKSB7XG4gICAgbGV0IHJldHJpZXMgPSAwO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIHJtKC4uLnJtQXJncykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzaGVsbC5ybSguLi5ybUFyZ3MpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXRyaWVzICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJpZXMgPCA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oLi4ucm1BcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJtKC4uLmFyZ3MpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIE1haW4gZW50aXR5LlxuICogQGNsYXNzXG4gKiBAcHJvcGVydHkge0Vudn0gZW52XG4gKiBAcHJvcGVydHkge0VsZWN0cm9ufSBlbGVjdHJvblxuICogQHByb3BlcnR5IHtJbnN0YWxsZXJCdWlsZGVyfSBpbnN0YWxsZXJCdWlsZGVyXG4gKiBAcHJvcGVydHkge0VsZWN0cm9uQXBwfSBlbGVjdHJvbkFwcFxuICogQHByb3BlcnR5IHtEZXNrdG9wfSBkZXNrdG9wXG4gKiBAcHJvcGVydHkge01ldGVvckFwcH0gbWV0ZW9yQXBwXG4gKi9cbmNsYXNzIE1ldGVvckRlc2t0b3Age1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0ICAgICAgICAtIE1ldGVvciBhcHAgZGlyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAgICAgICAtIG91dHB1dCBkaXIgZm9yIGJ1bmRsZS9wYWNrYWdlL2luc3RhbGxlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zICAgICAgLSBvcHRpb25zIGZyb20gY2xpLmpzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlcGVuZGVuY2llcyAtIGRlcGVuZGVuY2llcyBvYmplY3RcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpbnB1dCwgb3V0cHV0LCBvcHRpb25zLCBkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uc3QgTG9nID0gZGVwZW5kZW5jaWVzLmxvZztcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdpbmRleCcpO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSB0aGlzLmdldFZlcnNpb24oKTtcblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdpbml0aWFsaXppbmcnKTtcblxuICAgICAgICB0aGlzLmVudiA9IG5ldyBFbnYoaW5wdXQsIG91dHB1dCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWxlY3Ryb24gPSBuZXcgRWxlY3Ryb24odGhpcyk7XG4gICAgICAgIHRoaXMuZWxlY3Ryb25CdWlsZGVyID0gbmV3IEVsZWN0cm9uQnVpbGRlcih0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVjdHJvbkFwcCA9IG5ldyBFbGVjdHJvbkFwcCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZXNrdG9wID0gbmV3IERlc2t0b3AodGhpcyk7XG4gICAgICAgIHRoaXMubWV0ZW9yQXBwID0gbmV3IE1ldGVvckFwcCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYWNrYWdlciA9IG5ldyBQYWNrYWdlcih0aGlzKTtcbiAgICAgICAgdGhpcy51dGlscyA9IHtcbiAgICAgICAgICAgIGV4aXN0cyxcbiAgICAgICAgICAgIHJtV2l0aFJldHJpZXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byByZWFkIHRoZSB2ZXJzaW9uIGZyb20gb3VyIG93biBwYWNrYWdlLmpzb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZlcnNpb247XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmVyc2lvbiA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2ZXJzaW9uID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpLCAnVVRGLTgnKVxuICAgICAgICAgICAgKS52ZXJzaW9uO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihgZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIHJlYWQgJHtwYXRoLmpvaW4oX19kaXJuYW1lLCAncGFja2FnZS5qc29uJyl9YCwgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNjYWZmb2xkKCk7XG4gICAgICAgIHRoaXMubWV0ZW9yQXBwLnVwZGF0ZUdpdElnbm9yZSgpO1xuICAgIH1cblxuICAgIGFzeW5jIGJ1aWxkSW5zdGFsbGVyKCkge1xuICAgICAgICB0aGlzLmVudi5vcHRpb25zLmluc3RhbGxlckJ1aWxkID0gdHJ1ZTtcbiAgICAgICAgYXdhaXQgdGhpcy5lbGVjdHJvbkFwcC5idWlsZCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lbGVjdHJvbkJ1aWxkZXIuYnVpbGQoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIGluc3RhbGxlcicsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBhd2FpdCB0aGlzLmVsZWN0cm9uQXBwLmJ1aWxkKHRydWUpO1xuICAgIH1cblxuICAgIGFzeW5jIGJ1aWxkKCkge1xuICAgICAgICBhd2FpdCB0aGlzLmVsZWN0cm9uQXBwLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAganVzdFJ1bigpIHtcbiAgICAgICAgdGhpcy5lbGVjdHJvbi5ydW4oKTtcbiAgICB9XG5cbiAgICBhc3luYyBydW5QYWNrYWdlcigpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5lbGVjdHJvbkFwcC5idWlsZCgpO1xuXG4gICAgICAgIHRoaXMucGFja2FnZXIucGFja2FnZUFwcCgpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihgd2hpbGUgdHJ5aW5nIHRvIGJ1aWxkIGEgcGFja2FnZSBhbiBlcnJvciBvY2N1cnJlZDogJHtlfWApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4cG9ydHMoaW5wdXQsIG91dHB1dCwgb3B0aW9ucywgeyBsb2cgPSBMb2dnZXIgfSA9IHsgbG9nOiBMb2dnZXIgfSkge1xuICAgIHJldHVybiBuZXcgTWV0ZW9yRGVza3RvcChpbnB1dCwgb3V0cHV0LCBvcHRpb25zLCB7IGxvZyB9KTtcbn1cbiJdfQ==