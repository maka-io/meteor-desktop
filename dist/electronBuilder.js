'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _electronBuilder = require('electron-builder');

var _yarn = require('electron-builder/out/yarn');

var _readPackageJson = require('electron-builder/out/util/readPackageJson');

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper for electron-builder.
 */
var InstallerBuilder = function () {

    /**
     * @param {MeteorDesktop} $ - context
     *
     * @constructor
     */
    function InstallerBuilder($) {
        (0, _classCallCheck3.default)(this, InstallerBuilder);

        this.log = new _log2.default('electronBuilder');
        this.$ = $;
        this.firstPass = true;
        this.lastRebuild = {};
    }

    /**
     * Calls npm rebuild from electron-builder.
     * @param {string} arch
     * @param {string} platform
     * @returns {Promise}
     */


    (0, _createClass3.default)(InstallerBuilder, [{
        key: 'installOrRebuild',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(arch) {
                var platform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.platform;
                var devMetadata, results;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.log.debug('calling installOrRebuild from electron-builder for arch ' + arch);
                                _context.next = 3;
                                return (0, _readPackageJson.readPackageJson)(this.$.env.paths.meteorApp.packageJson);

                            case 3:
                                devMetadata = _context.sent;
                                _context.next = 6;
                                return (0, _readPackageJson.getElectronVersion)(devMetadata, this.$.env.paths.meteorApp.root);

                            case 6:
                                results = _context.sent;

                                this.lastRebuild = { platform: platform, arch: arch };
                                _context.next = 10;
                                return (0, _yarn.installOrRebuild)(this.$.desktop.getSettings().builderOptions || {}, this.$.env.paths.electronApp.root, results, platform, arch, false);

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function installOrRebuild(_x) {
                return _ref.apply(this, arguments);
            }

            return installOrRebuild;
        }()

        /**
         * Callback invoked before build is made. Ensures that app.asar have the right rebuilt
         * node_modules.
         *
         * @param {Object} context
         * @returns {Promise}
         */

    }, {
        key: 'beforeBuild',
        value: function beforeBuild(context) {
            var _this = this;

            return new _promise2.default(function (resolve) {
                var platformMatches = process.platform === context.platform.nodeName;
                var rebuild = platformMatches && context.arch !== _this.lastRebuild.arch;
                if (!platformMatches) {
                    _this.log.warn('skipping dependencies rebuild because platform is different, if you have native ' + 'node modules as your app dependencies you should od the build on the target platform only');
                }

                if (!rebuild) {
                    _this.moveNodeModulesOut();
                    resolve(false);
                } else {
                    _this.installOrRebuild(context.arch, context.platform.nodeName).then(function () {
                        _this.$.electronApp.scaffold.createAppRoot();
                        _this.$.electronApp.scaffold.copySkeletonApp();
                        return _this.$.electronApp.packSkeletonToAsar([_this.$.env.paths.electronApp.meteorAsar, _this.$.env.paths.electronApp.desktopAsar, _this.$.env.paths.electronApp.extracted]);
                    }).then(function () {
                        _this.moveNodeModulesOut();
                        resolve(false);
                    });
                }
            });
        }

        /**
         * Callback to be invoked after packing. Restores node_modules to the .desktop-build.
         * @returns {Promise}
         */

    }, {
        key: 'afterPack',
        value: function afterPack() {
            var _this2 = this;

            return new _promise2.default(function (resolve) {
                _this2.log.debug('moving node_modules back');
                // Move node_modules back.
                _shelljs2.default.mv(_this2.$.env.paths.electronApp.tmpNodeModules, _this2.$.env.paths.electronApp.nodeModules);

                if (_this2.firstPass) {
                    _this2.firstPass = false;
                }

                resolve();
            });
        }

        /**
         * Prepares the target object passed to the electron-builder.
         *
         * @returns {Map<Platform, Map<Arch, Array<string>>>}
         */

    }, {
        key: 'prepareTargets',
        value: function prepareTargets() {
            var arch = this.$.env.options.ia32 ? 'ia32' : 'x64';
            arch = this.$.env.options.allArchs ? 'all' : arch;

            var targets = [];

            if (this.$.env.options.win) {
                targets.push(_electronBuilder.Platform.WINDOWS);
            }
            if (this.$.env.options.linux) {
                targets.push(_electronBuilder.Platform.LINUX);
            }
            if (this.$.env.options.mac) {
                targets.push(_electronBuilder.Platform.MAC);
            }

            if (targets.length === 0) {
                if (this.$.env.os.isWindows) {
                    targets.push(_electronBuilder.Platform.WINDOWS);
                } else if (this.$.env.os.isLinux) {
                    targets.push(_electronBuilder.Platform.LINUX);
                } else {
                    targets.push(_electronBuilder.Platform.MAC);
                }
            }
            return (0, _electronBuilder.createTargets)(targets, null, arch);
        }
    }, {
        key: 'build',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var settings, builderOptions;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                settings = this.$.desktop.getSettings();

                                if (!('builderOptions' in settings)) {
                                    this.log.error('no builderOptions in settings.json, aborting');
                                    process.exit(1);
                                }

                                builderOptions = (0, _assign2.default)({}, settings.builderOptions);


                                builderOptions.asar = false;
                                builderOptions.npmRebuild = true;

                                builderOptions.beforeBuild = this.beforeBuild.bind(this);
                                builderOptions.afterPack = this.afterPack.bind(this);

                                builderOptions.directories = {
                                    app: this.$.env.paths.electronApp.root,
                                    output: _path2.default.join(this.$.env.options.output, this.$.env.paths.installerDir)
                                };

                                _context2.prev = 8;
                                _context2.next = 11;
                                return (0, _electronBuilder.build)((0, _assign2.default)({
                                    targets: this.prepareTargets(),
                                    config: builderOptions
                                }, settings.builderCliOptions));

                            case 11:
                                _context2.next = 16;
                                break;

                            case 13:
                                _context2.prev = 13;
                                _context2.t0 = _context2['catch'](8);

                                this.log.error('error while building installer: ', _context2.t0);

                            case 16:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[8, 13]]);
            }));

            function build() {
                return _ref2.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'moveNodeModulesOut',
        value: function moveNodeModulesOut() {
            this.log.debug('moving node_modules out, because we have them already in' + ' app.asar');
            _shelljs2.default.mv(this.$.env.paths.electronApp.nodeModules, this.$.env.paths.electronApp.tmpNodeModules);
        }
    }]);
    return InstallerBuilder;
}();

exports.default = InstallerBuilder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkJ1aWxkZXIuanMiXSwibmFtZXMiOlsiSW5zdGFsbGVyQnVpbGRlciIsIiQiLCJsb2ciLCJmaXJzdFBhc3MiLCJsYXN0UmVidWlsZCIsImFyY2giLCJwbGF0Zm9ybSIsInByb2Nlc3MiLCJkZWJ1ZyIsImVudiIsInBhdGhzIiwibWV0ZW9yQXBwIiwicGFja2FnZUpzb24iLCJkZXZNZXRhZGF0YSIsInJvb3QiLCJyZXN1bHRzIiwiZGVza3RvcCIsImdldFNldHRpbmdzIiwiYnVpbGRlck9wdGlvbnMiLCJlbGVjdHJvbkFwcCIsImNvbnRleHQiLCJyZXNvbHZlIiwicGxhdGZvcm1NYXRjaGVzIiwibm9kZU5hbWUiLCJyZWJ1aWxkIiwid2FybiIsIm1vdmVOb2RlTW9kdWxlc091dCIsImluc3RhbGxPclJlYnVpbGQiLCJ0aGVuIiwic2NhZmZvbGQiLCJjcmVhdGVBcHBSb290IiwiY29weVNrZWxldG9uQXBwIiwicGFja1NrZWxldG9uVG9Bc2FyIiwibWV0ZW9yQXNhciIsImRlc2t0b3BBc2FyIiwiZXh0cmFjdGVkIiwibXYiLCJ0bXBOb2RlTW9kdWxlcyIsIm5vZGVNb2R1bGVzIiwib3B0aW9ucyIsImlhMzIiLCJhbGxBcmNocyIsInRhcmdldHMiLCJ3aW4iLCJwdXNoIiwiV0lORE9XUyIsImxpbnV4IiwiTElOVVgiLCJtYWMiLCJNQUMiLCJsZW5ndGgiLCJvcyIsImlzV2luZG93cyIsImlzTGludXgiLCJzZXR0aW5ncyIsImVycm9yIiwiZXhpdCIsImFzYXIiLCJucG1SZWJ1aWxkIiwiYmVmb3JlQnVpbGQiLCJiaW5kIiwiYWZ0ZXJQYWNrIiwiZGlyZWN0b3JpZXMiLCJhcHAiLCJvdXRwdXQiLCJqb2luIiwiaW5zdGFsbGVyRGlyIiwicHJlcGFyZVRhcmdldHMiLCJjb25maWciLCJidWlsZGVyQ2xpT3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7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QUF0RDtBQUZpQixpQ0FBN0I7Ozs7dUNBTVUsNEJBQU0sc0JBQWM7QUFDdEJ4Qiw2Q0FBUyxLQUFLeUIsY0FBTCxFQURhO0FBRXRCQyw0Q0FBUWxEO0FBRmMsaUNBQWQsRUFHVG9DLFNBQVNlLGlCQUhBLENBQU4sQzs7Ozs7Ozs7OztBQUtOLHFDQUFLbkUsR0FBTCxDQUFTcUQsS0FBVCxDQUFlLGtDQUFmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NkNBSWE7QUFDakIsaUJBQUtyRCxHQUFMLENBQVNNLEtBQVQsQ0FBZSw2REFDWCxXQURKO0FBRUEsOEJBQU00QixFQUFOLENBQ0ksS0FBS25DLENBQUwsQ0FBT1EsR0FBUCxDQUFXQyxLQUFYLENBQWlCUyxXQUFqQixDQUE2Qm1CLFdBRGpDLEVBRUksS0FBS3JDLENBQUwsQ0FBT1EsR0FBUCxDQUFXQyxLQUFYLENBQWlCUyxXQUFqQixDQUE2QmtCLGNBRmpDO0FBSUg7Ozs7O2tCQWxLZ0JyQyxnQiIsImZpbGUiOiJlbGVjdHJvbkJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBidWlsZCwgUGxhdGZvcm0sIGNyZWF0ZVRhcmdldHMgfSBmcm9tICdlbGVjdHJvbi1idWlsZGVyJztcbmltcG9ydCB7IGluc3RhbGxPclJlYnVpbGQgfSBmcm9tICdlbGVjdHJvbi1idWlsZGVyL291dC95YXJuJztcbmltcG9ydCB7IGdldEVsZWN0cm9uVmVyc2lvbiwgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnZWxlY3Ryb24tYnVpbGRlci9vdXQvdXRpbC9yZWFkUGFja2FnZUpzb24nO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuLyoqXG4gKiBXcmFwcGVyIGZvciBlbGVjdHJvbi1idWlsZGVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnN0YWxsZXJCdWlsZGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWV0ZW9yRGVza3RvcH0gJCAtIGNvbnRleHRcbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQpIHtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdlbGVjdHJvbkJ1aWxkZXInKTtcbiAgICAgICAgdGhpcy4kID0gJDtcbiAgICAgICAgdGhpcy5maXJzdFBhc3MgPSB0cnVlO1xuICAgICAgICB0aGlzLmxhc3RSZWJ1aWxkID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbHMgbnBtIHJlYnVpbGQgZnJvbSBlbGVjdHJvbi1idWlsZGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmNoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYXRmb3JtXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYXN5bmMgaW5zdGFsbE9yUmVidWlsZChhcmNoLCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm0pIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoYGNhbGxpbmcgaW5zdGFsbE9yUmVidWlsZCBmcm9tIGVsZWN0cm9uLWJ1aWxkZXIgZm9yIGFyY2ggJHthcmNofWApO1xuICAgICAgICBjb25zdCBkZXZNZXRhZGF0YSA9IGF3YWl0IHJlYWRQYWNrYWdlSnNvbih0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5wYWNrYWdlSnNvbik7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBnZXRFbGVjdHJvblZlcnNpb24oZGV2TWV0YWRhdGEsXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5yb290KTtcbiAgICAgICAgdGhpcy5sYXN0UmVidWlsZCA9IHsgcGxhdGZvcm0sIGFyY2ggfTtcbiAgICAgICAgYXdhaXQgaW5zdGFsbE9yUmVidWlsZCh0aGlzLiQuZGVza3RvcC5nZXRTZXR0aW5ncygpLmJ1aWxkZXJPcHRpb25zIHx8IHt9LFxuICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290LCByZXN1bHRzLCBwbGF0Zm9ybSwgYXJjaCwgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGludm9rZWQgYmVmb3JlIGJ1aWxkIGlzIG1hZGUuIEVuc3VyZXMgdGhhdCBhcHAuYXNhciBoYXZlIHRoZSByaWdodCByZWJ1aWx0XG4gICAgICogbm9kZV9tb2R1bGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBiZWZvcmVCdWlsZChjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm1NYXRjaGVzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gY29udGV4dC5wbGF0Zm9ybS5ub2RlTmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHJlYnVpbGQgPSBwbGF0Zm9ybU1hdGNoZXMgJiYgY29udGV4dC5hcmNoICE9PSB0aGlzLmxhc3RSZWJ1aWxkLmFyY2g7XG4gICAgICAgICAgICBpZiAoIXBsYXRmb3JtTWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oJ3NraXBwaW5nIGRlcGVuZGVuY2llcyByZWJ1aWxkIGJlY2F1c2UgcGxhdGZvcm0gaXMgZGlmZmVyZW50LCBpZiB5b3UgaGF2ZSBuYXRpdmUgJyArXG4gICAgICAgICAgICAgICAgICAgICdub2RlIG1vZHVsZXMgYXMgeW91ciBhcHAgZGVwZW5kZW5jaWVzIHlvdSBzaG91bGQgb2QgdGhlIGJ1aWxkIG9uIHRoZSB0YXJnZXQgcGxhdGZvcm0gb25seScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJlYnVpbGQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVOb2RlTW9kdWxlc091dCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbGxPclJlYnVpbGQoY29udGV4dC5hcmNoLCBjb250ZXh0LnBsYXRmb3JtLm5vZGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZWxlY3Ryb25BcHAuc2NhZmZvbGQuY3JlYXRlQXBwUm9vdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVsZWN0cm9uQXBwLnNjYWZmb2xkLmNvcHlTa2VsZXRvbkFwcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJC5lbGVjdHJvbkFwcC5wYWNrU2tlbGV0b25Ub0FzYXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFzYXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZGVza3RvcEFzYXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlTm9kZU1vZHVsZXNPdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgdG8gYmUgaW52b2tlZCBhZnRlciBwYWNraW5nLiBSZXN0b3JlcyBub2RlX21vZHVsZXMgdG8gdGhlIC5kZXNrdG9wLWJ1aWxkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGFmdGVyUGFjaygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbW92aW5nIG5vZGVfbW9kdWxlcyBiYWNrJyk7XG4gICAgICAgICAgICAvLyBNb3ZlIG5vZGVfbW9kdWxlcyBiYWNrLlxuICAgICAgICAgICAgc2hlbGwubXYoXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlcyxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5maXJzdFBhc3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZXBhcmVzIHRoZSB0YXJnZXQgb2JqZWN0IHBhc3NlZCB0byB0aGUgZWxlY3Ryb24tYnVpbGRlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtNYXA8UGxhdGZvcm0sIE1hcDxBcmNoLCBBcnJheTxzdHJpbmc+Pj59XG4gICAgICovXG4gICAgcHJlcGFyZVRhcmdldHMoKSB7XG4gICAgICAgIGxldCBhcmNoID0gdGhpcy4kLmVudi5vcHRpb25zLmlhMzIgPyAnaWEzMicgOiAneDY0JztcbiAgICAgICAgYXJjaCA9IHRoaXMuJC5lbnYub3B0aW9ucy5hbGxBcmNocyA/ICdhbGwnIDogYXJjaDtcblxuICAgICAgICBjb25zdCB0YXJnZXRzID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy53aW4pIHtcbiAgICAgICAgICAgIHRhcmdldHMucHVzaChQbGF0Zm9ybS5XSU5ET1dTKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLmxpbnV4KSB7XG4gICAgICAgICAgICB0YXJnZXRzLnB1c2goUGxhdGZvcm0uTElOVVgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLiQuZW52Lm9wdGlvbnMubWFjKSB7XG4gICAgICAgICAgICB0YXJnZXRzLnB1c2goUGxhdGZvcm0uTUFDKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJC5lbnYub3MuaXNXaW5kb3dzKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKFBsYXRmb3JtLldJTkRPV1MpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLiQuZW52Lm9zLmlzTGludXgpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzLnB1c2goUGxhdGZvcm0uTElOVVgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzLnB1c2goUGxhdGZvcm0uTUFDKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlVGFyZ2V0cyh0YXJnZXRzLCBudWxsLCBhcmNoKTtcbiAgICB9XG5cbiAgICBhc3luYyBidWlsZCgpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB0aGlzLiQuZGVza3RvcC5nZXRTZXR0aW5ncygpO1xuICAgICAgICBpZiAoISgnYnVpbGRlck9wdGlvbnMnIGluIHNldHRpbmdzKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoXG4gICAgICAgICAgICAgICAgJ25vIGJ1aWxkZXJPcHRpb25zIGluIHNldHRpbmdzLmpzb24sIGFib3J0aW5nJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBidWlsZGVyT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzLmJ1aWxkZXJPcHRpb25zKTtcblxuICAgICAgICBidWlsZGVyT3B0aW9ucy5hc2FyID0gZmFsc2U7XG4gICAgICAgIGJ1aWxkZXJPcHRpb25zLm5wbVJlYnVpbGQgPSB0cnVlO1xuXG4gICAgICAgIGJ1aWxkZXJPcHRpb25zLmJlZm9yZUJ1aWxkID0gdGhpcy5iZWZvcmVCdWlsZC5iaW5kKHRoaXMpO1xuICAgICAgICBidWlsZGVyT3B0aW9ucy5hZnRlclBhY2sgPSB0aGlzLmFmdGVyUGFjay5iaW5kKHRoaXMpO1xuXG4gICAgICAgIGJ1aWxkZXJPcHRpb25zLmRpcmVjdG9yaWVzID0ge1xuICAgICAgICAgICAgYXBwOiB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsXG4gICAgICAgICAgICBvdXRwdXQ6IHBhdGguam9pbih0aGlzLiQuZW52Lm9wdGlvbnMub3V0cHV0LCB0aGlzLiQuZW52LnBhdGhzLmluc3RhbGxlckRpcilcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYnVpbGQoT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgdGFyZ2V0czogdGhpcy5wcmVwYXJlVGFyZ2V0cygpLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogYnVpbGRlck9wdGlvbnNcbiAgICAgICAgICAgIH0sIHNldHRpbmdzLmJ1aWxkZXJDbGlPcHRpb25zKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSBidWlsZGluZyBpbnN0YWxsZXI6ICcsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZU5vZGVNb2R1bGVzT3V0KCkge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbW92aW5nIG5vZGVfbW9kdWxlcyBvdXQsIGJlY2F1c2Ugd2UgaGF2ZSB0aGVtIGFscmVhZHkgaW4nICtcbiAgICAgICAgICAgICcgYXBwLmFzYXInKTtcbiAgICAgICAgc2hlbGwubXYoXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzLFxuICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlc1xuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==