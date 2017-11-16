'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _sort = require('babel-runtime/core-js/array/sort');

var _sort2 = _interopRequireDefault(_sort);

var _concat = require('babel-runtime/core-js/array/concat');

var _concat2 = _interopRequireDefault(_concat);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _asar = require('asar');

var _asar2 = _interopRequireDefault(_asar);

var _assignIn = require('lodash/assignIn');

var _assignIn2 = _interopRequireDefault(_assignIn);

var _babelCore = require('babel-core');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _babelPresetEs = require('babel-preset-es2015');

var _babelPresetEs2 = _interopRequireDefault(_babelPresetEs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _babelPresetNode = require('babel-preset-node6');

var _babelPresetNode2 = _interopRequireDefault(_babelPresetNode);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _electronAppScaffold = require('./electronAppScaffold');

var _electronAppScaffold2 = _interopRequireDefault(_electronAppScaffold);

var _dependenciesManager = require('./dependenciesManager');

var _dependenciesManager2 = _interopRequireDefault(_dependenciesManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_shelljs2.default.config.fatal = true;

/**
 * Represents the .desktop dir scaffold.
 * @class
 */

var ElectronApp = function () {

    /**
     * @param {MeteorDesktop} $ - context
     * @constructor
     */
    function ElectronApp($) {
        (0, _classCallCheck3.default)(this, ElectronApp);

        this.log = new _log2.default('electronApp');
        this.scaffold = new _electronAppScaffold2.default($);
        this.depsManager = new _dependenciesManager2.default($, this.scaffold.getDefaultPackageJson().dependencies);
        this.$ = $;
        this.meteorApp = this.$.meteorApp;
        this.packageJson = null;
        this.version = null;
        this.compatibilityVersion = null;
    }

    /**
     * Makes an app.asar from the skeleton app.
     * @property {Array} excludeFromDel - list of paths to exclude from deleting
     * @returns {Promise}
     */


    (0, _createClass3.default)(ElectronApp, [{
        key: 'packSkeletonToAsar',
        value: function packSkeletonToAsar() {
            var _this = this;

            var excludeFromDel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            this.log.info('packing skeleton app and node_modules to asar archive');
            return new _promise2.default(function (resolve) {
                // We want to pack skeleton app and node_modules together, so we need to temporarily
                // move node_modules to app dir.
                _this.log.debug('moving node_modules to app dir');
                _shelljs2.default.mv(_this.$.env.paths.electronApp.nodeModules, _path2.default.join(_this.$.env.paths.electronApp.appRoot, 'node_modules'));
                _this.log.debug('packing');
                _asar2.default.createPackage(_this.$.env.paths.electronApp.appRoot, _this.$.env.paths.electronApp.appAsar, function () {
                    // Lets move the node_modules back.
                    _this.log.debug('moving node_modules back from app dir');
                    _shelljs2.default.mv(_path2.default.join(_this.$.env.paths.electronApp.appRoot, 'node_modules'), _this.$.env.paths.electronApp.nodeModules);
                    _this.log.debug('deleting source files');
                    var exclude = (0, _concat2.default)([_this.$.env.paths.electronApp.nodeModules, _this.$.env.paths.electronApp.appAsar, _this.$.env.paths.electronApp.packageJson], excludeFromDel);

                    _del2.default.sync((0, _concat2.default)(['' + _this.$.env.paths.electronApp.root + _path2.default.sep + '*'], exclude.map(function (pathToExclude) {
                        return '!' + pathToExclude;
                    })));
                    resolve();
                });
            });
        }

        /**
         * Calculates a md5 from all dependencies.
         */

    }, {
        key: 'calculateCompatibilityVersion',
        value: function calculateCompatibilityVersion() {
            var _this2 = this;

            this.log.verbose('calculating compatibility version');
            var md5 = _crypto2.default.createHash('md5');
            var dependencies = (0, _sort2.default)((0, _keys2.default)(this.packageJson.dependencies));
            dependencies = dependencies.map(function (dependency) {
                return dependency + ':' + _this2.packageJson.dependencies[dependency];
            });
            var mainCompatibilityVersion = this.$.getVersion().split('.');
            this.log.debug('meteor-desktop compatibility version is ', mainCompatibilityVersion[0] + '.' + mainCompatibilityVersion[1]);
            dependencies.push('meteor-desktop:' + mainCompatibilityVersion[0] + '.' + mainCompatibilityVersion[1]);

            var desktopCompatibilityVersion = this.$.desktop.getSettings().version.split('.')[0];
            this.log.debug('.desktop compatibility version is ', desktopCompatibilityVersion);
            dependencies.push('desktop-app:' + desktopCompatibilityVersion);

            if (process.env.METEOR_DESKTOP_DEBUG_DESKTOP_COMPATIBILITY_VERSION || process.env.METEOR_DESKTOP_DEBUG) {
                this.log.debug('compatibility version calculated from ' + (0, _stringify2.default)(dependencies));
            }

            md5.update((0, _stringify2.default)(dependencies));
            this.compatibilityVersion = md5.digest('hex');
        }

        /**
         * Runs all necessary tasks to build the desktopified app.
         */

    }, {
        key: 'build',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var run = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // TODO: refactor to a task runner
                                this.log.info('scaffolding');

                                if (!this.$.desktop.check()) {
                                    if (!this.$.env.options.scaffold) {
                                        this.log.error('seems that you do not have a .desktop dir in your project or it is' + ' corrupted. Run \'npm run desktop -- init\' to get a new one.');
                                        // Do not fail, so that npm will not print his error stuff to console.
                                        process.exit(0);
                                    } else {
                                        this.$.desktop.scaffold();
                                        this.$.meteorApp.updateGitIgnore();
                                    }
                                }

                                try {
                                    this.$.meteorApp.updateGitIgnore();
                                } catch (e) {
                                    this.log.warn('error occurred while adding ' + this.$.env.paths.electronApp.rootName + 'to .gitignore: ', e);
                                }

                                _context.prev = 3;
                                _context.next = 6;
                                return this.$.meteorApp.ensureDesktopHCPPackages();

                            case 6:
                                _context.next = 12;
                                break;

                            case 8:
                                _context.prev = 8;
                                _context.t0 = _context['catch'](3);

                                this.log.error('error while checking for required packages: ', _context.t0);
                                process.exit(1);

                            case 12:
                                _context.prev = 12;
                                _context.next = 15;
                                return this.scaffold.make();

                            case 15:
                                _context.next = 21;
                                break;

                            case 17:
                                _context.prev = 17;
                                _context.t1 = _context['catch'](12);

                                this.log.error('error while scaffolding: ', _context.t1);
                                process.exit(1);

                            case 21:

                                try {
                                    this.updatePackageJsonFields();
                                } catch (e) {
                                    this.log.error('error while updating package.json: ', e);
                                }

                                try {
                                    this.updateDependenciesList();
                                } catch (e) {
                                    this.log.error('error while merging dependencies list: ', e);
                                }

                                try {
                                    this.calculateCompatibilityVersion();
                                } catch (e) {
                                    this.log.error('error while calculating compatibility version: ', e);
                                    process.exit(1);
                                }

                                _context.prev = 24;
                                _context.next = 27;
                                return this.handleTemporaryNodeModules();

                            case 27:
                                _context.next = 33;
                                break;

                            case 29:
                                _context.prev = 29;
                                _context.t2 = _context['catch'](24);

                                this.log.error('error occurred while handling temporary node_modules: ', _context.t2);
                                process.exit(1);

                            case 33:
                                _context.prev = 33;
                                _context.next = 36;
                                return this.ensureDeps();

                            case 36:
                                _context.next = 42;
                                break;

                            case 38:
                                _context.prev = 38;
                                _context.t3 = _context['catch'](33);

                                this.log.error('error occurred while running npm: ', _context.t3);
                                process.exit(1);

                            case 42:
                                _context.prev = 42;
                                _context.next = 45;
                                return this.ensureMeteorDependencies();

                            case 45:
                                _context.next = 51;
                                break;

                            case 47:
                                _context.prev = 47;
                                _context.t4 = _context['catch'](42);

                                this.log.error('error occurred while running npm: ', _context.t4);
                                process.exit(1);

                            case 51:
                                _context.prev = 51;
                                _context.next = 54;
                                return this.rebuildDeps();

                            case 54:
                                _context.next = 60;
                                break;

                            case 56:
                                _context.prev = 56;
                                _context.t5 = _context['catch'](51);

                                this.log.error('error occurred while rebuilding native node modules: ', _context.t5);
                                process.exit(1);

                            case 60:
                                if (!this.$.env.isProductionBuild()) {
                                    _context.next = 70;
                                    break;
                                }

                                _context.prev = 61;
                                _context.next = 64;
                                return this.packSkeletonToAsar();

                            case 64:
                                _context.next = 70;
                                break;

                            case 66:
                                _context.prev = 66;
                                _context.t6 = _context['catch'](61);

                                this.log.error('error while packing skeleton to asar: ', _context.t6);
                                process.exit(1);

                            case 70:

                                // TODO: find a way to avoid copying .desktop to a temp location
                                try {
                                    this.copyDesktopToDesktopTemp();
                                } catch (e) {
                                    this.log.error('error while copying .desktop to a temporary location: ', e);
                                    process.exit(1);
                                }

                                try {
                                    this.updateSettingsJsonFields();
                                } catch (e) {
                                    this.log.error('error while updating settings.json: ', e);
                                    process.exit(1);
                                }

                                _context.prev = 72;
                                _context.next = 75;
                                return this.excludeFilesFromArchive();

                            case 75:
                                _context.next = 81;
                                break;

                            case 77:
                                _context.prev = 77;
                                _context.t7 = _context['catch'](72);

                                this.log.error('error while excluding files from packing to asar: ', _context.t7);
                                process.exit(1);

                            case 81:

                                try {
                                    this.transpileAndMinify();
                                } catch (e) {
                                    this.log.error('error while transpiling or minifying: ', e);
                                }

                                _context.prev = 82;
                                _context.next = 85;
                                return this.packDesktopToAsar();

                            case 85:
                                _context.next = 91;
                                break;

                            case 87:
                                _context.prev = 87;
                                _context.t8 = _context['catch'](82);

                                this.log.error('error occurred while packing .desktop to asar: ', _context.t8);
                                process.exit(1);

                            case 91:
                                _context.prev = 91;
                                _context.next = 94;
                                return this.getMeteorClientBuild();

                            case 94:
                                _context.next = 99;
                                break;

                            case 96:
                                _context.prev = 96;
                                _context.t9 = _context['catch'](91);

                                this.log.error('error occurred during getting meteor mobile build: ', _context.t9);

                            case 99:

                                if (run) {
                                    this.log.info('running');
                                    this.$.electron.run();
                                } else {
                                    this.log.info('built');
                                }

                            case 100:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[3, 8], [12, 17], [24, 29], [33, 38], [42, 47], [51, 56], [61, 66], [72, 77], [82, 87], [91, 96]]);
            }));

            function build() {
                return _ref.apply(this, arguments);
            }

            return build;
        }()

        /**
         * Ensures all required dependencies are added to the Meteor project.
         * @returns {Promise.<void>}
         */

    }, {
        key: 'ensureMeteorDependencies',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var _this3 = this;

                var packages, packagesWithVersion, plugins;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                packages = [];
                                packagesWithVersion = [];
                                plugins = 'plugins [';


                                (0, _keys2.default)(this.$.desktop.getDependencies().plugins).forEach(function (plugin) {
                                    // Read package.json of the plugin.
                                    var packageJson = JSON.parse(_fs2.default.readFileSync(_path2.default.join(_this3.$.env.paths.electronApp.nodeModules, plugin, 'package.json'), 'utf8'));

                                    if ('meteorDependencies' in packageJson && (0, _typeof3.default)(packageJson.meteorDependencies) === 'object') {
                                        plugins += plugin + ', ';
                                        packages.unshift.apply(packages, (0, _toConsumableArray3.default)((0, _keys2.default)(packageJson.meteorDependencies)));
                                        packagesWithVersion.unshift.apply(packagesWithVersion, (0, _toConsumableArray3.default)(packages.map(function (packageName) {
                                            if (packageJson.meteorDependencies[packageName] === '@version') {
                                                return packageName + '@' + packageJson.version;
                                            }
                                            return packageName + '@' + packageJson.meteorDependencies[packageName];
                                        })));
                                    }
                                });

                                if (!(packages.length > 0)) {
                                    _context2.next = 14;
                                    break;
                                }

                                plugins = plugins.substr(0, plugins.length - 2) + ']';
                                _context2.prev = 6;
                                _context2.next = 9;
                                return this.$.meteorApp.meteorManager.ensurePackages(packages, packagesWithVersion, plugins);

                            case 9:
                                _context2.next = 14;
                                break;

                            case 11:
                                _context2.prev = 11;
                                _context2.t0 = _context2['catch'](6);
                                throw new Error(_context2.t0);

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 11]]);
            }));

            function ensureMeteorDependencies() {
                return _ref2.apply(this, arguments);
            }

            return ensureMeteorDependencies;
        }()

        /**
         * Builds meteor app.
         */

    }, {
        key: 'getMeteorClientBuild',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.$.meteorApp.build();

                            case 2:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getMeteorClientBuild() {
                return _ref3.apply(this, arguments);
            }

            return getMeteorClientBuild;
        }()
    }, {
        key: 'handleTemporaryNodeModules',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!this.$.utils.exists(this.$.env.paths.electronApp.tmpNodeModules)) {
                                    _context4.next = 15;
                                    break;
                                }

                                if (this.$.utils.exists(this.$.env.paths.electronApp.nodeModules)) {
                                    _context4.next = 6;
                                    break;
                                }

                                this.log.debug('moving temp node_modules back');
                                _shelljs2.default.mv(this.$.env.paths.electronApp.tmpNodeModules, this.$.env.paths.electronApp.nodeModules);
                                _context4.next = 15;
                                break;

                            case 6:
                                // If there is a node_modules folder, we should clear the temporary one.
                                this.log.debug('clearing temp node_modules because new one is already created');
                                _context4.prev = 7;
                                _context4.next = 10;
                                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.tmpNodeModules);

                            case 10:
                                _context4.next = 15;
                                break;

                            case 12:
                                _context4.prev = 12;
                                _context4.t0 = _context4['catch'](7);
                                throw new Error(_context4.t0);

                            case 15:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[7, 12]]);
            }));

            function handleTemporaryNodeModules() {
                return _ref4.apply(this, arguments);
            }

            return handleTemporaryNodeModules;
        }()

        /**
         * Wrapper for spawning npm.
         * @param {Array}  commands - commands for spawn
         * @param {string} stdio
         * @return {Promise}
         */

    }, {
        key: 'runNpm',
        value: function runNpm(commands) {
            var _this4 = this;

            var stdio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ignore';

            return new _promise2.default(function (resolve, reject) {
                // TODO: find a way to run npm without depending on it cause it's a huge dependency.
                var npm = _path2.default.join(_this4.$.env.paths.meteorApp.root, 'node_modules', '.bin', 'npm');
                _this4.log.verbose('executing npm ' + commands.join(' '));

                (0, _crossSpawn2.default)(npm, commands, {
                    cwd: _this4.$.env.paths.electronApp.root,
                    stdio: stdio
                }).on('exit', function (code) {
                    return code === 0 ? resolve() : reject('npm exit code was ' + code);
                });
            });
        }

        /**
         * Runs npm link for every package specified in settings.json->linkPackages.
         */

    }, {
        key: 'linkNpmPackages',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                var _this5 = this;

                var settings, promises;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                settings = this.$.desktop.getSettings();
                                promises = [];

                                if ('linkPackages' in this.$.desktop.getSettings()) {
                                    if (Array.isArray(settings.linkPackages)) {
                                        settings.linkPackages.forEach(function (packageName) {
                                            return promises.push(_this5.runNpm(['link', packageName]));
                                        });
                                    }
                                }
                                _context5.next = 5;
                                return _promise2.default.all(promises);

                            case 5:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function linkNpmPackages() {
                return _ref5.apply(this, arguments);
            }

            return linkNpmPackages;
        }()

        /**
         * Runs npm in the electron app to get the dependencies installed.
         * @returns {Promise}
         */

    }, {
        key: 'ensureDeps',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.linkNpmPackages();

                            case 2:

                                this.log.info('installing dependencies');

                                if (!this.$.utils.exists(this.$.env.paths.electronApp.nodeModules)) {
                                    _context6.next = 13;
                                    break;
                                }

                                this.log.debug('running npm prune to wipe unneeded dependencies');
                                _context6.prev = 5;
                                _context6.next = 8;
                                return this.runNpm(['prune']);

                            case 8:
                                _context6.next = 13;
                                break;

                            case 10:
                                _context6.prev = 10;
                                _context6.t0 = _context6['catch'](5);
                                throw new Error(_context6.t0);

                            case 13:
                                _context6.prev = 13;
                                _context6.next = 16;
                                return this.runNpm(['install'], this.$.env.stdio);

                            case 16:
                                _context6.next = 21;
                                break;

                            case 18:
                                _context6.prev = 18;
                                _context6.t1 = _context6['catch'](13);
                                throw new Error(_context6.t1);

                            case 21:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[5, 10], [13, 18]]);
            }));

            function ensureDeps() {
                return _ref6.apply(this, arguments);
            }

            return ensureDeps;
        }()

        /**
         * Warns if plugins version are outdated in compare to the newest scaffold.
         * @param {Object} pluginsVersions - current plugins versions from settings.json
         */

    }, {
        key: 'checkPluginsVersion',
        value: function checkPluginsVersion(pluginsVersions) {
            var _this6 = this;

            var settingsJson = JSON.parse(_fs2.default.readFileSync(_path2.default.join(this.$.env.paths.scaffold, 'settings.json')));
            var scaffoldPluginsVersion = this.$.desktop.getDependencies(settingsJson, false).plugins;
            (0, _keys2.default)(pluginsVersions).forEach(function (pluginName) {
                if (pluginName in scaffoldPluginsVersion && scaffoldPluginsVersion[pluginName] !== pluginsVersions[pluginName] && _semver2.default.lt(pluginsVersions[pluginName], scaffoldPluginsVersion[pluginName])) {
                    _this6.log.warn('you are using outdated version ' + pluginsVersions[pluginName] + ' of ' + (pluginName + ', the suggested version to use is ') + ('' + scaffoldPluginsVersion[pluginName]));
                }
            });
        }

        /**
         * Merges core dependency list with the dependencies from .desktop.
         */

    }, {
        key: 'updateDependenciesList',
        value: function updateDependenciesList() {
            var _this7 = this;

            this.log.info('updating list of package.json\'s dependencies');
            var desktopDependencies = this.$.desktop.getDependencies();

            this.checkPluginsVersion(desktopDependencies.plugins);

            this.log.debug('merging settings.json[dependencies]');
            this.depsManager.mergeDependencies('settings.json[dependencies]', desktopDependencies.fromSettings);
            this.log.debug('merging settings.json[plugins]');
            this.depsManager.mergeDependencies('settings.json[plugins]', desktopDependencies.plugins);

            this.log.debug('merging dependencies from modules');
            (0, _keys2.default)(desktopDependencies.modules).forEach(function (module) {
                return _this7.depsManager.mergeDependencies('module[' + module + ']', desktopDependencies.modules[module]);
            });

            this.packageJson.dependencies = this.depsManager.getDependencies();

            this.log.debug('writing updated package.json');
            _fs2.default.writeFileSync(this.$.env.paths.electronApp.packageJson, (0, _stringify2.default)(this.packageJson, null, 2));
        }

        /**
         * Rebuild binary dependencies against Electron's node headers.
         * @returns {Promise}
         */

    }, {
        key: 'rebuildDeps',
        value: function rebuildDeps() {
            if (!this.$.desktop.getSettings().rebuildNativeNodeModules) {
                this.log.warn('native modules rebuild is turned off, be sure to turn it on if you' + ' added any native node ' + 'modules');
                return _promise2.default.resolve();
            }

            this.log.info('issuing native modules rebuild from electron-builder');

            var arch = this.$.env.options.ia32 || process.arch === 'ia32' ? 'ia32' : 'x64';

            if (this.$.env.options.ia32) {
                this.log.verbose('forcing rebuild for 32bit');
            } else {
                this.log.verbose('rebuilding for ' + arch);
            }

            return this.$.electronBuilder.installOrRebuild(arch);
        }

        /**
         * Update package.json fields accordingly to what is set in settings.json.
         *
         * packageJson.name = settings.projectName
         * packageJson.version = settings.version
         * packageJson.* = settings.packageJsonFields
         */

    }, {
        key: 'updatePackageJsonFields',
        value: function updatePackageJsonFields() {
            this.log.verbose('updating package.json fields');
            var settings = this.$.desktop.getSettings();
            /** @type {desktopSettings} */
            var packageJson = this.scaffold.getDefaultPackageJson();

            packageJson.version = settings.version;
            if ('packageJsonFields' in settings) {
                (0, _assignIn2.default)(packageJson, settings.packageJsonFields);
            }
            (0, _assignIn2.default)(packageJson, { name: settings.projectName });

            this.log.debug('writing updated package.json');
            _fs2.default.writeFileSync(this.$.env.paths.electronApp.packageJson, (0, _stringify2.default)(packageJson, null, 4));
            this.packageJson = packageJson;
        }

        /**
         * Updates settings.json with env (prod/dev) information and versions.
         */

    }, {
        key: 'updateSettingsJsonFields',
        value: function updateSettingsJsonFields() {
            this.log.debug('updating settings.json fields');
            var settings = this.$.desktop.getSettings();

            // Save versions.
            settings.desktopVersion = this.$.desktop.getHashVersion();
            settings.compatibilityVersion = this.compatibilityVersion;

            // Pass information about build type to the settings.json.
            settings.env = this.$.env.isProductionBuild() ? 'prod' : 'dev';

            settings.meteorDesktopVersion = this.$.getVersion();

            _fs2.default.writeFileSync(this.$.env.paths.desktopTmp.settings, (0, _stringify2.default)(settings, null, 4));
        }

        /**
         * Copies files from prepared .desktop to desktop.asar in electron app.
         */

    }, {
        key: 'packDesktopToAsar',
        value: function packDesktopToAsar() {
            var _this8 = this;

            this.log.info('packing .desktop to asar');
            return new _promise2.default(function (resolve, reject) {
                _asar2.default.createPackage(_this8.$.env.paths.desktopTmp.root, _this8.$.env.paths.electronApp.desktopAsar, function () {
                    _this8.log.verbose('clearing temporary .desktop');
                    _this8.$.utils.rmWithRetries('-rf', _this8.$.env.paths.desktopTmp.root).then(function () {
                        resolve();
                    }).catch(function (e) {
                        reject(e);
                    });
                });
            });
        }

        /**
         * Makes a temporary copy of .desktop.
         */

    }, {
        key: 'copyDesktopToDesktopTemp',
        value: function copyDesktopToDesktopTemp() {
            this.log.verbose('copying .desktop to temporary location');
            _shelljs2.default.cp('-rf', this.$.env.paths.desktop.root, this.$.env.paths.desktopTmp.root);
            // Remove test files.
            _del2.default.sync([_path2.default.join(this.$.env.paths.desktopTmp.root, '**', '*.test.js')]);
        }

        /**
         * Runs babel and uglify over .desktop if requested.
         */

    }, {
        key: 'transpileAndMinify',
        value: function transpileAndMinify() {
            this.log.info('transpiling and uglifying');

            var settings = this.$.desktop.getSettings();
            var options = 'uglifyOptions' in settings ? settings.uglifyOptions : {};
            options.fromString = true;
            var uglifyingEnabled = 'uglify' in settings && !!settings.uglify;

            // Unfortunately `reify` will not work when we require a .js file from an asar archive.
            // So here we will transpile .desktop to have the ES6 modules working.

            // Uglify does not handle ES6 yet, so we will have to transpile to ES5 for now.
            var preset = uglifyingEnabled && settings.env === 'prod' ? _babelPresetEs2.default : _babelPresetNode2.default;

            _glob2.default.sync(this.$.env.paths.desktopTmp.root + '/**/*.js').forEach(function (file) {
                var _transformFileSync = (0, _babelCore.transformFileSync)(file, {
                    presets: [preset]
                }),
                    code = _transformFileSync.code;

                if (settings.env === 'prod' && uglifyingEnabled) {
                    code = _uglifyJs2.default.minify(code, options).code;
                }
                _fs2.default.writeFileSync(file, code);
            });
        }

        /**
         * Moves all the files that should not be packed into asar into a safe location which is the
         * 'extracted' dir in the electron app.
         */

    }, {
        key: 'excludeFilesFromArchive',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
                var _this9 = this;

                var configs;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                this.log.info('excluding files from packing');

                                // Ensure empty `extracted` dir

                                _context7.prev = 1;
                                _context7.next = 4;
                                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.extracted);

                            case 4:
                                _context7.next = 9;
                                break;

                            case 6:
                                _context7.prev = 6;
                                _context7.t0 = _context7['catch'](1);
                                throw new Error(_context7.t0);

                            case 9:

                                _shelljs2.default.mkdir(this.$.env.paths.electronApp.extracted);

                                configs = this.$.desktop.gatherModuleConfigs();

                                // Move files that should not be asar'ed.

                                configs.forEach(function (config) {
                                    var moduleConfig = config;
                                    if ('extract' in moduleConfig) {
                                        if (!Array.isArray(moduleConfig.extract)) {
                                            moduleConfig.extract = [moduleConfig.extract];
                                        }
                                        moduleConfig.extract.forEach(function (file) {
                                            _this9.log.debug('excluding ' + file + ' from ' + config.name);
                                            var filePath = _path2.default.join(_this9.$.env.paths.desktopTmp.modules, moduleConfig.dirName, file);
                                            var destinationPath = _path2.default.join(_this9.$.env.paths.electronApp.extracted, moduleConfig.dirName);

                                            if (!_this9.$.utils.exists(destinationPath)) {
                                                _shelljs2.default.mkdir(destinationPath);
                                            }
                                            _shelljs2.default.mv(filePath, destinationPath);
                                        });
                                    }
                                });

                            case 12:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[1, 6]]);
            }));

            function excludeFilesFromArchive() {
                return _ref7.apply(this, arguments);
            }

            return excludeFilesFromArchive;
        }()
    }]);
    return ElectronApp;
}();

exports.default = ElectronApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkFwcC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJmYXRhbCIsIkVsZWN0cm9uQXBwIiwiJCIsImxvZyIsInNjYWZmb2xkIiwiZGVwc01hbmFnZXIiLCJnZXREZWZhdWx0UGFja2FnZUpzb24iLCJkZXBlbmRlbmNpZXMiLCJtZXRlb3JBcHAiLCJwYWNrYWdlSnNvbiIsInZlcnNpb24iLCJjb21wYXRpYmlsaXR5VmVyc2lvbiIsImV4Y2x1ZGVGcm9tRGVsIiwiaW5mbyIsInJlc29sdmUiLCJkZWJ1ZyIsIm12IiwiZW52IiwicGF0aHMiLCJlbGVjdHJvbkFwcCIsIm5vZGVNb2R1bGVzIiwiam9pbiIsImFwcFJvb3QiLCJjcmVhdGVQYWNrYWdlIiwiYXBwQXNhciIsImV4Y2x1ZGUiLCJzeW5jIiwicm9vdCIsInNlcCIsIm1hcCIsInBhdGhUb0V4Y2x1ZGUiLCJ2ZXJib3NlIiwibWQ1IiwiY3JlYXRlSGFzaCIsImRlcGVuZGVuY3kiLCJtYWluQ29tcGF0aWJpbGl0eVZlcnNpb24iLCJnZXRWZXJzaW9uIiwic3BsaXQiLCJwdXNoIiwiZGVza3RvcENvbXBhdGliaWxpdHlWZXJzaW9uIiwiZGVza3RvcCIsImdldFNldHRpbmdzIiwicHJvY2VzcyIsIk1FVEVPUl9ERVNLVE9QX0RFQlVHX0RFU0tUT1BfQ09NUEFUSUJJTElUWV9WRVJTSU9OIiwiTUVURU9SX0RFU0tUT1BfREVCVUciLCJ1cGRhdGUiLCJkaWdlc3QiLCJydW4iLCJjaGVjayIsIm9wdGlvbnMiLCJlcnJvciIsImV4aXQiLCJ1cGRhdGVHaXRJZ25vcmUiLCJlIiwid2FybiIsInJvb3ROYW1lIiwiZW5zdXJlRGVza3RvcEhDUFBhY2thZ2VzIiwibWFrZSIsInVwZGF0ZVBhY2thZ2VKc29uRmllbGRzIiwidXBkYXRlRGVwZW5kZW5jaWVzTGlzdCIsImNhbGN1bGF0ZUNvbXBhdGliaWxpdHlWZXJzaW9uIiwiaGFuZGxlVGVtcG9yYXJ5Tm9kZU1vZHVsZXMiLCJlbnN1cmVEZXBzIiwiZW5zdXJlTWV0ZW9yRGVwZW5kZW5jaWVzIiwicmVidWlsZERlcHMiLCJpc1Byb2R1Y3Rpb25CdWlsZCIsInBhY2tTa2VsZXRvblRvQXNhciIsImNvcHlEZXNrdG9wVG9EZXNrdG9wVGVtcCIsInVwZGF0ZVNldHRpbmdzSnNvbkZpZWxkcyIsImV4Y2x1ZGVGaWxlc0Zyb21BcmNoaXZlIiwidHJhbnNwaWxlQW5kTWluaWZ5IiwicGFja0Rlc2t0b3BUb0FzYXIiLCJnZXRNZXRlb3JDbGllbnRCdWlsZCIsImVsZWN0cm9uIiwicGFja2FnZXMiLCJwYWNrYWdlc1dpdGhWZXJzaW9uIiwicGx1Z2lucyIsImdldERlcGVuZGVuY2llcyIsImZvckVhY2giLCJwbHVnaW4iLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJtZXRlb3JEZXBlbmRlbmNpZXMiLCJ1bnNoaWZ0IiwicGFja2FnZU5hbWUiLCJsZW5ndGgiLCJzdWJzdHIiLCJtZXRlb3JNYW5hZ2VyIiwiZW5zdXJlUGFja2FnZXMiLCJFcnJvciIsImJ1aWxkIiwidXRpbHMiLCJleGlzdHMiLCJ0bXBOb2RlTW9kdWxlcyIsInJtV2l0aFJldHJpZXMiLCJjb21tYW5kcyIsInN0ZGlvIiwicmVqZWN0IiwibnBtIiwiY3dkIiwib24iLCJjb2RlIiwic2V0dGluZ3MiLCJwcm9taXNlcyIsIkFycmF5IiwiaXNBcnJheSIsImxpbmtQYWNrYWdlcyIsInJ1bk5wbSIsImFsbCIsImxpbmtOcG1QYWNrYWdlcyIsInBsdWdpbnNWZXJzaW9ucyIsInNldHRpbmdzSnNvbiIsInNjYWZmb2xkUGx1Z2luc1ZlcnNpb24iLCJwbHVnaW5OYW1lIiwibHQiLCJkZXNrdG9wRGVwZW5kZW5jaWVzIiwiY2hlY2tQbHVnaW5zVmVyc2lvbiIsIm1lcmdlRGVwZW5kZW5jaWVzIiwiZnJvbVNldHRpbmdzIiwibW9kdWxlcyIsIm1vZHVsZSIsIndyaXRlRmlsZVN5bmMiLCJyZWJ1aWxkTmF0aXZlTm9kZU1vZHVsZXMiLCJhcmNoIiwiaWEzMiIsImVsZWN0cm9uQnVpbGRlciIsImluc3RhbGxPclJlYnVpbGQiLCJwYWNrYWdlSnNvbkZpZWxkcyIsIm5hbWUiLCJwcm9qZWN0TmFtZSIsImRlc2t0b3BWZXJzaW9uIiwiZ2V0SGFzaFZlcnNpb24iLCJtZXRlb3JEZXNrdG9wVmVyc2lvbiIsImRlc2t0b3BUbXAiLCJkZXNrdG9wQXNhciIsInRoZW4iLCJjYXRjaCIsImNwIiwidWdsaWZ5T3B0aW9ucyIsImZyb21TdHJpbmciLCJ1Z2xpZnlpbmdFbmFibGVkIiwidWdsaWZ5IiwicHJlc2V0IiwiZmlsZSIsInByZXNldHMiLCJtaW5pZnkiLCJleHRyYWN0ZWQiLCJta2RpciIsImNvbmZpZ3MiLCJnYXRoZXJNb2R1bGVDb25maWdzIiwibW9kdWxlQ29uZmlnIiwiZXh0cmFjdCIsImZpbGVQYXRoIiwiZGlyTmFtZSIsImRlc3RpbmF0aW9uUGF0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUdBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsa0JBQU1BLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjs7QUFFQTs7Ozs7SUFJcUJDLFc7O0FBRWpCOzs7O0FBSUEseUJBQVlDLENBQVosRUFBZTtBQUFBOztBQUNYLGFBQUtDLEdBQUwsR0FBVyxrQkFBUSxhQUFSLENBQVg7QUFDQSxhQUFLQyxRQUFMLEdBQWdCLGtDQUF3QkYsQ0FBeEIsQ0FBaEI7QUFDQSxhQUFLRyxXQUFMLEdBQW1CLGtDQUNmSCxDQURlLEVBRWYsS0FBS0UsUUFBTCxDQUFjRSxxQkFBZCxHQUFzQ0MsWUFGdkIsQ0FBbkI7QUFJQSxhQUFLTCxDQUFMLEdBQVNBLENBQVQ7QUFDQSxhQUFLTSxTQUFMLEdBQWlCLEtBQUtOLENBQUwsQ0FBT00sU0FBeEI7QUFD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LENBQUwsRUFBMEM7QUFDdENELHlEQUFhQyxPQUFiLEdBQXVCLENBQUNELGFBQWFDLE9BQWQsQ0FBdkI7QUFDSDtBQUNERCxxREFBYUMsT0FBYixDQUFxQjFFLE9BQXJCLENBQTZCLFVBQUNrRSxJQUFELEVBQVU7QUFDbkMsbURBQUs3SSxHQUFMLENBQVNZLEtBQVQsZ0JBQTRCaUksSUFBNUIsY0FBeUNqSixPQUFPa0ksSUFBaEQ7QUFDQSxnREFBTXdCLFdBQVcsZUFBS3BJLElBQUwsQ0FDYixPQUFLbkIsQ0FBTCxDQUFPZSxHQUFQLENBQVdDLEtBQVgsQ0FBaUJvSCxVQUFqQixDQUE0QmQsT0FEZixFQUN3QitCLGFBQWFHLE9BRHJDLEVBQzhDVixJQUQ5QyxDQUFqQjtBQUVBLGdEQUFNVyxrQkFBa0IsZUFBS3RJLElBQUwsQ0FDcEIsT0FBS25CLENBQUwsQ0FBT2UsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxXQUFqQixDQUE2QmdJLFNBRFQsRUFDb0JJLGFBQWFHLE9BRGpDLENBQXhCOztBQUdBLGdEQUFJLENBQUMsT0FBS3hKLENBQUwsQ0FBTzBGLEtBQVAsQ0FBYUMsTUFBYixDQUFvQjhELGVBQXBCLENBQUwsRUFBMkM7QUFDdkMsa0VBQU1QLEtBQU4sQ0FBWU8sZUFBWjtBQUNIO0FBQ0QsOERBQU0zSSxFQUFOLENBQVN5SSxRQUFULEVBQW1CRSxlQUFuQjtBQUNILHlDQVhEO0FBWUg7QUFDSixpQ0FuQkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWpsQmExSixXIiwiZmlsZSI6ImVsZWN0cm9uQXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzYXIgZnJvbSAnYXNhcic7XG5pbXBvcnQgYXNzaWduSW4gZnJvbSAnbG9kYXNoL2Fzc2lnbkluJztcbmltcG9ydCB7IHRyYW5zZm9ybUZpbGVTeW5jIH0gZnJvbSAnYmFiZWwtY29yZSc7XG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgZGVsIGZyb20gJ2RlbCc7XG5pbXBvcnQgZXMyMDE1UHJlc2V0IGZyb20gJ2JhYmVsLXByZXNldC1lczIwMTUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IG5vZGU2UHJlc2V0IGZyb20gJ2JhYmVsLXByZXNldC1ub2RlNic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBzcGF3biBmcm9tICdjcm9zcy1zcGF3bic7XG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgdWdsaWZ5IGZyb20gJ3VnbGlmeS1qcyc7XG5cblxuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgRWxlY3Ryb25BcHBTY2FmZm9sZCBmcm9tICcuL2VsZWN0cm9uQXBwU2NhZmZvbGQnO1xuaW1wb3J0IERlcGVuZGVuY2llc01hbmFnZXIgZnJvbSAnLi9kZXBlbmRlbmNpZXNNYW5hZ2VyJztcblxuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSAuZGVza3RvcCBkaXIgc2NhZmZvbGQuXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlY3Ryb25BcHAge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNZXRlb3JEZXNrdG9wfSAkIC0gY29udGV4dFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQpIHtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdlbGVjdHJvbkFwcCcpO1xuICAgICAgICB0aGlzLnNjYWZmb2xkID0gbmV3IEVsZWN0cm9uQXBwU2NhZmZvbGQoJCk7XG4gICAgICAgIHRoaXMuZGVwc01hbmFnZXIgPSBuZXcgRGVwZW5kZW5jaWVzTWFuYWdlcihcbiAgICAgICAgICAgICQsXG4gICAgICAgICAgICB0aGlzLnNjYWZmb2xkLmdldERlZmF1bHRQYWNrYWdlSnNvbigpLmRlcGVuZGVuY2llc1xuICAgICAgICApO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgICAgICB0aGlzLm1ldGVvckFwcCA9IHRoaXMuJC5tZXRlb3JBcHA7XG4gICAgICAgIHRoaXMucGFja2FnZUpzb24gPSBudWxsO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBudWxsO1xuICAgICAgICB0aGlzLmNvbXBhdGliaWxpdHlWZXJzaW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhbiBhcHAuYXNhciBmcm9tIHRoZSBza2VsZXRvbiBhcHAuXG4gICAgICogQHByb3BlcnR5IHtBcnJheX0gZXhjbHVkZUZyb21EZWwgLSBsaXN0IG9mIHBhdGhzIHRvIGV4Y2x1ZGUgZnJvbSBkZWxldGluZ1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHBhY2tTa2VsZXRvblRvQXNhcihleGNsdWRlRnJvbURlbCA9IFtdKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ3BhY2tpbmcgc2tlbGV0b24gYXBwIGFuZCBub2RlX21vZHVsZXMgdG8gYXNhciBhcmNoaXZlJyk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBwYWNrIHNrZWxldG9uIGFwcCBhbmQgbm9kZV9tb2R1bGVzIHRvZ2V0aGVyLCBzbyB3ZSBuZWVkIHRvIHRlbXBvcmFyaWx5XG4gICAgICAgICAgICAvLyBtb3ZlIG5vZGVfbW9kdWxlcyB0byBhcHAgZGlyLlxuICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ21vdmluZyBub2RlX21vZHVsZXMgdG8gYXBwIGRpcicpO1xuICAgICAgICAgICAgc2hlbGwubXYoXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlcyxcbiAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5hcHBSb290LCAnbm9kZV9tb2R1bGVzJylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygncGFja2luZycpO1xuICAgICAgICAgICAgYXNhci5jcmVhdGVQYWNrYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcEFzYXIsXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZXRzIG1vdmUgdGhlIG5vZGVfbW9kdWxlcyBiYWNrLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbW92aW5nIG5vZGVfbW9kdWxlcyBiYWNrIGZyb20gYXBwIGRpcicpO1xuICAgICAgICAgICAgICAgICAgICBzaGVsbC5tdihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QsICdub2RlX21vZHVsZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXNcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ2RlbGV0aW5nIHNvdXJjZSBmaWxlcycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleGNsdWRlID0gQXJyYXkuY29uY2F0KFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcEFzYXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnBhY2thZ2VKc29uXG4gICAgICAgICAgICAgICAgICAgIF0sIGV4Y2x1ZGVGcm9tRGVsKTtcblxuICAgICAgICAgICAgICAgICAgICBkZWwuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbYCR7dGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290fSR7cGF0aC5zZXB9KmBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGUubWFwKHBhdGhUb0V4Y2x1ZGUgPT4gYCEke3BhdGhUb0V4Y2x1ZGV9YClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgYSBtZDUgZnJvbSBhbGwgZGVwZW5kZW5jaWVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNvbXBhdGliaWxpdHlWZXJzaW9uKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjYWxjdWxhdGluZyBjb21wYXRpYmlsaXR5IHZlcnNpb24nKTtcbiAgICAgICAgY29uc3QgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpO1xuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzID0gQXJyYXkuc29ydChPYmplY3Qua2V5cyh0aGlzLnBhY2thZ2VKc29uLmRlcGVuZGVuY2llcykpO1xuICAgICAgICBkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMubWFwKGRlcGVuZGVuY3kgPT5cbiAgICAgICAgICAgIGAke2RlcGVuZGVuY3l9OiR7dGhpcy5wYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV19YFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBtYWluQ29tcGF0aWJpbGl0eVZlcnNpb24gPSB0aGlzLiQuZ2V0VmVyc2lvbigpLnNwbGl0KCcuJyk7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCdtZXRlb3ItZGVza3RvcCBjb21wYXRpYmlsaXR5IHZlcnNpb24gaXMgJyxcbiAgICAgICAgICAgIGAke21haW5Db21wYXRpYmlsaXR5VmVyc2lvblswXX0uJHttYWluQ29tcGF0aWJpbGl0eVZlcnNpb25bMV19YCk7XG4gICAgICAgIGRlcGVuZGVuY2llcy5wdXNoKFxuICAgICAgICAgICAgYG1ldGVvci1kZXNrdG9wOiR7bWFpbkNvbXBhdGliaWxpdHlWZXJzaW9uWzBdfS4ke21haW5Db21wYXRpYmlsaXR5VmVyc2lvblsxXX1gKTtcblxuICAgICAgICBjb25zdCBkZXNrdG9wQ29tcGF0aWJpbGl0eVZlcnNpb24gPSB0aGlzLiQuZGVza3RvcC5nZXRTZXR0aW5ncygpLnZlcnNpb24uc3BsaXQoJy4nKVswXTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJy5kZXNrdG9wIGNvbXBhdGliaWxpdHkgdmVyc2lvbiBpcyAnLCBkZXNrdG9wQ29tcGF0aWJpbGl0eVZlcnNpb24pO1xuICAgICAgICBkZXBlbmRlbmNpZXMucHVzaChcbiAgICAgICAgICAgIGBkZXNrdG9wLWFwcDoke2Rlc2t0b3BDb21wYXRpYmlsaXR5VmVyc2lvbn1gKTtcblxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTUVURU9SX0RFU0tUT1BfREVCVUdfREVTS1RPUF9DT01QQVRJQklMSVRZX1ZFUlNJT04gfHxcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk1FVEVPUl9ERVNLVE9QX0RFQlVHXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoYGNvbXBhdGliaWxpdHkgdmVyc2lvbiBjYWxjdWxhdGVkIGZyb20gJHtKU09OLnN0cmluZ2lmeShkZXBlbmRlbmNpZXMpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgbWQ1LnVwZGF0ZShKU09OLnN0cmluZ2lmeShkZXBlbmRlbmNpZXMpKTtcbiAgICAgICAgdGhpcy5jb21wYXRpYmlsaXR5VmVyc2lvbiA9IG1kNS5kaWdlc3QoJ2hleCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgYWxsIG5lY2Vzc2FyeSB0YXNrcyB0byBidWlsZCB0aGUgZGVza3RvcGlmaWVkIGFwcC5cbiAgICAgKi9cbiAgICBhc3luYyBidWlsZChydW4gPSBmYWxzZSkge1xuICAgICAgICAvLyBUT0RPOiByZWZhY3RvciB0byBhIHRhc2sgcnVubmVyXG4gICAgICAgIHRoaXMubG9nLmluZm8oJ3NjYWZmb2xkaW5nJyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLiQuZGVza3RvcC5jaGVjaygpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuJC5lbnYub3B0aW9ucy5zY2FmZm9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdzZWVtcyB0aGF0IHlvdSBkbyBub3QgaGF2ZSBhIC5kZXNrdG9wIGRpciBpbiB5b3VyIHByb2plY3Qgb3IgaXQgaXMnICtcbiAgICAgICAgICAgICAgICAgICAgJyBjb3JydXB0ZWQuIFJ1biBcXCducG0gcnVuIGRlc2t0b3AgLS0gaW5pdFxcJyB0byBnZXQgYSBuZXcgb25lLicpO1xuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBmYWlsLCBzbyB0aGF0IG5wbSB3aWxsIG5vdCBwcmludCBoaXMgZXJyb3Igc3R1ZmYgdG8gY29uc29sZS5cbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJC5kZXNrdG9wLnNjYWZmb2xkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kLm1ldGVvckFwcC51cGRhdGVHaXRJZ25vcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLiQubWV0ZW9yQXBwLnVwZGF0ZUdpdElnbm9yZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy53YXJuKGBlcnJvciBvY2N1cnJlZCB3aGlsZSBhZGRpbmcgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lfWAgK1xuICAgICAgICAgICAgICAgICd0byAuZ2l0aWdub3JlOiAnLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLiQubWV0ZW9yQXBwLmVuc3VyZURlc2t0b3BIQ1BQYWNrYWdlcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY2hlY2tpbmcgZm9yIHJlcXVpcmVkIHBhY2thZ2VzOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNjYWZmb2xkLm1ha2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHNjYWZmb2xkaW5nOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhY2thZ2VKc29uRmllbGRzKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSB1cGRhdGluZyBwYWNrYWdlLmpzb246ICcsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGVwZW5kZW5jaWVzTGlzdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgbWVyZ2luZyBkZXBlbmRlbmNpZXMgbGlzdDogJywgZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDb21wYXRpYmlsaXR5VmVyc2lvbigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY2FsY3VsYXRpbmcgY29tcGF0aWJpbGl0eSB2ZXJzaW9uOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHRlbXBvcmFyeSBub2RlX21vZHVsZXMgZm9sZGVyIGFuZCBubyBub2RlX21vZHVsZXMgZm9sZGVyLCB3ZSB3aWxsXG4gICAgICAgICAgICAvLyByZXN0b3JlIGl0LCBhcyBpdCBtaWdodCBiZSBhIGxlZnRvdmVyIGZyb20gYW4gaW50ZXJydXB0ZWQgZmxvdy5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlVGVtcG9yYXJ5Tm9kZU1vZHVsZXMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIHRlbXBvcmFyeSBub2RlX21vZHVsZXM6ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW5zdXJlRGVwcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgcnVubmluZyBucG06ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW5zdXJlTWV0ZW9yRGVwZW5kZW5jaWVzKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCB3aGlsZSBydW5uaW5nIG5wbTogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWJ1aWxkRGVwcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmVidWlsZGluZyBuYXRpdmUgbm9kZSBtb2R1bGVzOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLiQuZW52LmlzUHJvZHVjdGlvbkJ1aWxkKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wYWNrU2tlbGV0b25Ub0FzYXIoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgcGFja2luZyBza2VsZXRvbiB0byBhc2FyOiAnLCBlKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgd2F5IHRvIGF2b2lkIGNvcHlpbmcgLmRlc2t0b3AgdG8gYSB0ZW1wIGxvY2F0aW9uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNvcHlEZXNrdG9wVG9EZXNrdG9wVGVtcCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY29weWluZyAuZGVza3RvcCB0byBhIHRlbXBvcmFyeSBsb2NhdGlvbjogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTZXR0aW5nc0pzb25GaWVsZHMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHVwZGF0aW5nIHNldHRpbmdzLmpzb246ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhjbHVkZUZpbGVzRnJvbUFyY2hpdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIGV4Y2x1ZGluZyBmaWxlcyBmcm9tIHBhY2tpbmcgdG8gYXNhcjogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cmFuc3BpbGVBbmRNaW5pZnkoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHRyYW5zcGlsaW5nIG9yIG1pbmlmeWluZzogJywgZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wYWNrRGVza3RvcFRvQXNhcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgcGFja2luZyAuZGVza3RvcCB0byBhc2FyOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdldE1ldGVvckNsaWVudEJ1aWxkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCBkdXJpbmcgZ2V0dGluZyBtZXRlb3IgbW9iaWxlIGJ1aWxkOiAnLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydW4pIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ3J1bm5pbmcnKTtcbiAgICAgICAgICAgIHRoaXMuJC5lbGVjdHJvbi5ydW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2J1aWx0Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmVzIGFsbCByZXF1aXJlZCBkZXBlbmRlbmNpZXMgYXJlIGFkZGVkIHRvIHRoZSBNZXRlb3IgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48dm9pZD59XG4gICAgICovXG4gICAgYXN5bmMgZW5zdXJlTWV0ZW9yRGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBjb25zdCBwYWNrYWdlcyA9IFtdO1xuICAgICAgICBjb25zdCBwYWNrYWdlc1dpdGhWZXJzaW9uID0gW107XG4gICAgICAgIGxldCBwbHVnaW5zID0gJ3BsdWdpbnMgWyc7XG5cbiAgICAgICAgT2JqZWN0LmtleXModGhpcy4kLmRlc2t0b3AuZ2V0RGVwZW5kZW5jaWVzKCkucGx1Z2lucykuZm9yRWFjaCgocGx1Z2luKSA9PiB7XG4gICAgICAgICAgICAvLyBSZWFkIHBhY2thZ2UuanNvbiBvZiB0aGUgcGx1Z2luLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPVxuICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzLCBwbHVnaW4sICdwYWNrYWdlLmpzb24nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1dGY4J1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCdtZXRlb3JEZXBlbmRlbmNpZXMnIGluIHBhY2thZ2VKc29uICYmIHR5cGVvZiBwYWNrYWdlSnNvbi5tZXRlb3JEZXBlbmRlbmNpZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2lucyArPSBgJHtwbHVnaW59LCBgO1xuICAgICAgICAgICAgICAgIHBhY2thZ2VzLnVuc2hpZnQoLi4uT2JqZWN0LmtleXMocGFja2FnZUpzb24ubWV0ZW9yRGVwZW5kZW5jaWVzKSk7XG4gICAgICAgICAgICAgICAgcGFja2FnZXNXaXRoVmVyc2lvbi51bnNoaWZ0KC4uLnBhY2thZ2VzLm1hcCgocGFja2FnZU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhY2thZ2VKc29uLm1ldGVvckRlcGVuZGVuY2llc1twYWNrYWdlTmFtZV0gPT09ICdAdmVyc2lvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwYWNrYWdlTmFtZX1AJHtwYWNrYWdlSnNvbi52ZXJzaW9ufWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3BhY2thZ2VOYW1lfUAke3BhY2thZ2VKc29uLm1ldGVvckRlcGVuZGVuY2llc1twYWNrYWdlTmFtZV19YDtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwYWNrYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwbHVnaW5zID0gYCR7cGx1Z2lucy5zdWJzdHIoMCwgcGx1Z2lucy5sZW5ndGggLSAyKX1dYDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy4kLm1ldGVvckFwcC5tZXRlb3JNYW5hZ2VyLmVuc3VyZVBhY2thZ2VzKFxuICAgICAgICAgICAgICAgICAgICBwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbiwgcGx1Z2lucyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIG1ldGVvciBhcHAuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0TWV0ZW9yQ2xpZW50QnVpbGQoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuJC5tZXRlb3JBcHAuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBoYW5kbGVUZW1wb3JhcnlOb2RlTW9kdWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlcykpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdtb3ZpbmcgdGVtcCBub2RlX21vZHVsZXMgYmFjaycpO1xuICAgICAgICAgICAgICAgIHNoZWxsLm12KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBub2RlX21vZHVsZXMgZm9sZGVyLCB3ZSBzaG91bGQgY2xlYXIgdGhlIHRlbXBvcmFyeSBvbmUuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ2NsZWFyaW5nIHRlbXAgbm9kZV9tb2R1bGVzIGJlY2F1c2UgbmV3IG9uZSBpcyBhbHJlYWR5IGNyZWF0ZWQnKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLiQudXRpbHMucm1XaXRoUmV0cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBzcGF3bmluZyBucG0uXG4gICAgICogQHBhcmFtIHtBcnJheX0gIGNvbW1hbmRzIC0gY29tbWFuZHMgZm9yIHNwYXduXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ZGlvXG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBydW5OcG0oY29tbWFuZHMsIHN0ZGlvID0gJ2lnbm9yZScpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE86IGZpbmQgYSB3YXkgdG8gcnVuIG5wbSB3aXRob3V0IGRlcGVuZGluZyBvbiBpdCBjYXVzZSBpdCdzIGEgaHVnZSBkZXBlbmRlbmN5LlxuICAgICAgICAgICAgY29uc3QgbnBtID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsICdub2RlX21vZHVsZXMnLCAnLmJpbicsICducG0nKTtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGV4ZWN1dGluZyBucG0gJHtjb21tYW5kcy5qb2luKCcgJyl9YCk7XG5cbiAgICAgICAgICAgIHNwYXduKG5wbSwgY29tbWFuZHMsIHtcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCxcbiAgICAgICAgICAgICAgICBzdGRpb1xuICAgICAgICAgICAgfSkub24oJ2V4aXQnLCBjb2RlID0+IChcbiAgICAgICAgICAgICAgICAgICAgKGNvZGUgPT09IDApID8gcmVzb2x2ZSgpIDogcmVqZWN0KGBucG0gZXhpdCBjb2RlIHdhcyAke2NvZGV9YClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgbnBtIGxpbmsgZm9yIGV2ZXJ5IHBhY2thZ2Ugc3BlY2lmaWVkIGluIHNldHRpbmdzLmpzb24tPmxpbmtQYWNrYWdlcy5cbiAgICAgKi9cbiAgICBhc3luYyBsaW5rTnBtUGFja2FnZXMoKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgaWYgKCdsaW5rUGFja2FnZXMnIGluIHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCkpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNldHRpbmdzLmxpbmtQYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5saW5rUGFja2FnZXMuZm9yRWFjaChwYWNrYWdlTmFtZSA9PlxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMucnVuTnBtKFsnbGluaycsIHBhY2thZ2VOYW1lXSkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyBucG0gaW4gdGhlIGVsZWN0cm9uIGFwcCB0byBnZXQgdGhlIGRlcGVuZGVuY2llcyBpbnN0YWxsZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYXN5bmMgZW5zdXJlRGVwcygpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5saW5rTnBtUGFja2FnZXMoKTtcblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdpbnN0YWxsaW5nIGRlcGVuZGVuY2llcycpO1xuICAgICAgICBpZiAodGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ3J1bm5pbmcgbnBtIHBydW5lIHRvIHdpcGUgdW5uZWVkZWQgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuTnBtKFsncHJ1bmUnXSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ1bk5wbShbJ2luc3RhbGwnXSwgdGhpcy4kLmVudi5zdGRpbyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhcm5zIGlmIHBsdWdpbnMgdmVyc2lvbiBhcmUgb3V0ZGF0ZWQgaW4gY29tcGFyZSB0byB0aGUgbmV3ZXN0IHNjYWZmb2xkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW5zVmVyc2lvbnMgLSBjdXJyZW50IHBsdWdpbnMgdmVyc2lvbnMgZnJvbSBzZXR0aW5ncy5qc29uXG4gICAgICovXG4gICAgY2hlY2tQbHVnaW5zVmVyc2lvbihwbHVnaW5zVmVyc2lvbnMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NKc29uID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5zY2FmZm9sZCwgJ3NldHRpbmdzLmpzb24nKSlcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgc2NhZmZvbGRQbHVnaW5zVmVyc2lvbiA9IHRoaXMuJC5kZXNrdG9wLmdldERlcGVuZGVuY2llcyhzZXR0aW5nc0pzb24sIGZhbHNlKS5wbHVnaW5zO1xuICAgICAgICBPYmplY3Qua2V5cyhwbHVnaW5zVmVyc2lvbnMpLmZvckVhY2goKHBsdWdpbk5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwbHVnaW5OYW1lIGluIHNjYWZmb2xkUGx1Z2luc1ZlcnNpb24gJiZcbiAgICAgICAgICAgICAgICBzY2FmZm9sZFBsdWdpbnNWZXJzaW9uW3BsdWdpbk5hbWVdICE9PSBwbHVnaW5zVmVyc2lvbnNbcGx1Z2luTmFtZV0gJiZcbiAgICAgICAgICAgICAgICBzZW12ZXIubHQocGx1Z2luc1ZlcnNpb25zW3BsdWdpbk5hbWVdLCBzY2FmZm9sZFBsdWdpbnNWZXJzaW9uW3BsdWdpbk5hbWVdKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cud2FybihgeW91IGFyZSB1c2luZyBvdXRkYXRlZCB2ZXJzaW9uICR7cGx1Z2luc1ZlcnNpb25zW3BsdWdpbk5hbWVdfSBvZiBgICtcbiAgICAgICAgICAgICAgICAgICAgYCR7cGx1Z2luTmFtZX0sIHRoZSBzdWdnZXN0ZWQgdmVyc2lvbiB0byB1c2UgaXMgYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3NjYWZmb2xkUGx1Z2luc1ZlcnNpb25bcGx1Z2luTmFtZV19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlcyBjb3JlIGRlcGVuZGVuY3kgbGlzdCB3aXRoIHRoZSBkZXBlbmRlbmNpZXMgZnJvbSAuZGVza3RvcC5cbiAgICAgKi9cbiAgICB1cGRhdGVEZXBlbmRlbmNpZXNMaXN0KCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCd1cGRhdGluZyBsaXN0IG9mIHBhY2thZ2UuanNvblxcJ3MgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgIGNvbnN0IGRlc2t0b3BEZXBlbmRlbmNpZXMgPSB0aGlzLiQuZGVza3RvcC5nZXREZXBlbmRlbmNpZXMoKTtcblxuICAgICAgICB0aGlzLmNoZWNrUGx1Z2luc1ZlcnNpb24oZGVza3RvcERlcGVuZGVuY2llcy5wbHVnaW5zKTtcblxuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbWVyZ2luZyBzZXR0aW5ncy5qc29uW2RlcGVuZGVuY2llc10nKTtcbiAgICAgICAgdGhpcy5kZXBzTWFuYWdlci5tZXJnZURlcGVuZGVuY2llcyhcbiAgICAgICAgICAgICdzZXR0aW5ncy5qc29uW2RlcGVuZGVuY2llc10nLFxuICAgICAgICAgICAgZGVza3RvcERlcGVuZGVuY2llcy5mcm9tU2V0dGluZ3NcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ21lcmdpbmcgc2V0dGluZ3MuanNvbltwbHVnaW5zXScpO1xuICAgICAgICB0aGlzLmRlcHNNYW5hZ2VyLm1lcmdlRGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgJ3NldHRpbmdzLmpzb25bcGx1Z2luc10nLFxuICAgICAgICAgICAgZGVza3RvcERlcGVuZGVuY2llcy5wbHVnaW5zXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ21lcmdpbmcgZGVwZW5kZW5jaWVzIGZyb20gbW9kdWxlcycpO1xuICAgICAgICBPYmplY3Qua2V5cyhkZXNrdG9wRGVwZW5kZW5jaWVzLm1vZHVsZXMpLmZvckVhY2gobW9kdWxlID0+XG4gICAgICAgICAgICB0aGlzLmRlcHNNYW5hZ2VyLm1lcmdlRGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgICAgIGBtb2R1bGVbJHttb2R1bGV9XWAsXG4gICAgICAgICAgICAgICAgZGVza3RvcERlcGVuZGVuY2llcy5tb2R1bGVzW21vZHVsZV1cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnBhY2thZ2VKc29uLmRlcGVuZGVuY2llcyA9IHRoaXMuZGVwc01hbmFnZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ3dyaXRpbmcgdXBkYXRlZCBwYWNrYWdlLmpzb24nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucGFja2FnZUpzb24sIEpTT04uc3RyaW5naWZ5KHRoaXMucGFja2FnZUpzb24sIG51bGwsIDIpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVidWlsZCBiaW5hcnkgZGVwZW5kZW5jaWVzIGFnYWluc3QgRWxlY3Ryb24ncyBub2RlIGhlYWRlcnMuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgcmVidWlsZERlcHMoKSB7XG4gICAgICAgIGlmICghdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKS5yZWJ1aWxkTmF0aXZlTm9kZU1vZHVsZXMpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLndhcm4oJ25hdGl2ZSBtb2R1bGVzIHJlYnVpbGQgaXMgdHVybmVkIG9mZiwgYmUgc3VyZSB0byB0dXJuIGl0IG9uIGlmIHlvdScgK1xuICAgICAgICAgICAgICAgICcgYWRkZWQgYW55IG5hdGl2ZSBub2RlICcgK1xuICAgICAgICAgICAgICAgICdtb2R1bGVzJyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdpc3N1aW5nIG5hdGl2ZSBtb2R1bGVzIHJlYnVpbGQgZnJvbSBlbGVjdHJvbi1idWlsZGVyJyk7XG5cbiAgICAgICAgY29uc3QgYXJjaCA9IHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyIHx8IHByb2Nlc3MuYXJjaCA9PT0gJ2lhMzInID8gJ2lhMzInIDogJ3g2NCc7XG5cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdmb3JjaW5nIHJlYnVpbGQgZm9yIDMyYml0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGByZWJ1aWxkaW5nIGZvciAke2FyY2h9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy4kLmVsZWN0cm9uQnVpbGRlci5pbnN0YWxsT3JSZWJ1aWxkKGFyY2gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwYWNrYWdlLmpzb24gZmllbGRzIGFjY29yZGluZ2x5IHRvIHdoYXQgaXMgc2V0IGluIHNldHRpbmdzLmpzb24uXG4gICAgICpcbiAgICAgKiBwYWNrYWdlSnNvbi5uYW1lID0gc2V0dGluZ3MucHJvamVjdE5hbWVcbiAgICAgKiBwYWNrYWdlSnNvbi52ZXJzaW9uID0gc2V0dGluZ3MudmVyc2lvblxuICAgICAqIHBhY2thZ2VKc29uLiogPSBzZXR0aW5ncy5wYWNrYWdlSnNvbkZpZWxkc1xuICAgICAqL1xuICAgIHVwZGF0ZVBhY2thZ2VKc29uRmllbGRzKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCd1cGRhdGluZyBwYWNrYWdlLmpzb24gZmllbGRzJyk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgLyoqIEB0eXBlIHtkZXNrdG9wU2V0dGluZ3N9ICovXG4gICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gdGhpcy5zY2FmZm9sZC5nZXREZWZhdWx0UGFja2FnZUpzb24oKTtcblxuICAgICAgICBwYWNrYWdlSnNvbi52ZXJzaW9uID0gc2V0dGluZ3MudmVyc2lvbjtcbiAgICAgICAgaWYgKCdwYWNrYWdlSnNvbkZpZWxkcycgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIGFzc2lnbkluKHBhY2thZ2VKc29uLCBzZXR0aW5ncy5wYWNrYWdlSnNvbkZpZWxkcyk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzaWduSW4ocGFja2FnZUpzb24sIHsgbmFtZTogc2V0dGluZ3MucHJvamVjdE5hbWUgfSk7XG5cbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ3dyaXRpbmcgdXBkYXRlZCBwYWNrYWdlLmpzb24nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucGFja2FnZUpzb24sIEpTT04uc3RyaW5naWZ5KHBhY2thZ2VKc29uLCBudWxsLCA0KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBhY2thZ2VKc29uID0gcGFja2FnZUpzb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBzZXR0aW5ncy5qc29uIHdpdGggZW52IChwcm9kL2RldikgaW5mb3JtYXRpb24gYW5kIHZlcnNpb25zLlxuICAgICAqL1xuICAgIHVwZGF0ZVNldHRpbmdzSnNvbkZpZWxkcygpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ3VwZGF0aW5nIHNldHRpbmdzLmpzb24gZmllbGRzJyk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcblxuICAgICAgICAvLyBTYXZlIHZlcnNpb25zLlxuICAgICAgICBzZXR0aW5ncy5kZXNrdG9wVmVyc2lvbiA9IHRoaXMuJC5kZXNrdG9wLmdldEhhc2hWZXJzaW9uKCk7XG4gICAgICAgIHNldHRpbmdzLmNvbXBhdGliaWxpdHlWZXJzaW9uID0gdGhpcy5jb21wYXRpYmlsaXR5VmVyc2lvbjtcblxuICAgICAgICAvLyBQYXNzIGluZm9ybWF0aW9uIGFib3V0IGJ1aWxkIHR5cGUgdG8gdGhlIHNldHRpbmdzLmpzb24uXG4gICAgICAgIHNldHRpbmdzLmVudiA9ICh0aGlzLiQuZW52LmlzUHJvZHVjdGlvbkJ1aWxkKCkpID9cbiAgICAgICAgICAgICdwcm9kJyA6ICdkZXYnO1xuXG4gICAgICAgIHNldHRpbmdzLm1ldGVvckRlc2t0b3BWZXJzaW9uID0gdGhpcy4kLmdldFZlcnNpb24oKTtcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5kZXNrdG9wVG1wLnNldHRpbmdzLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgNClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZmlsZXMgZnJvbSBwcmVwYXJlZCAuZGVza3RvcCB0byBkZXNrdG9wLmFzYXIgaW4gZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIHBhY2tEZXNrdG9wVG9Bc2FyKCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdwYWNraW5nIC5kZXNrdG9wIHRvIGFzYXInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGFzYXIuY3JlYXRlUGFja2FnZShcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3BUbXAucm9vdCxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmRlc2t0b3BBc2FyLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnY2xlYXJpbmcgdGVtcG9yYXJ5IC5kZXNrdG9wJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC51dGlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnJtV2l0aFJldHJpZXMoJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcFRtcC5yb290KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIHRlbXBvcmFyeSBjb3B5IG9mIC5kZXNrdG9wLlxuICAgICAqL1xuICAgIGNvcHlEZXNrdG9wVG9EZXNrdG9wVGVtcCgpIHtcbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnY29weWluZyAuZGVza3RvcCB0byB0ZW1wb3JhcnkgbG9jYXRpb24nKTtcbiAgICAgICAgc2hlbGwuY3AoJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5yb290LCB0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3BUbXAucm9vdCk7XG4gICAgICAgIC8vIFJlbW92ZSB0ZXN0IGZpbGVzLlxuICAgICAgICBkZWwuc3luYyhbXG4gICAgICAgICAgICBwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5kZXNrdG9wVG1wLnJvb3QsICcqKicsICcqLnRlc3QuanMnKVxuICAgICAgICBdKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgYmFiZWwgYW5kIHVnbGlmeSBvdmVyIC5kZXNrdG9wIGlmIHJlcXVlc3RlZC5cbiAgICAgKi9cbiAgICB0cmFuc3BpbGVBbmRNaW5pZnkoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ3RyYW5zcGlsaW5nIGFuZCB1Z2xpZnlpbmcnKTtcblxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSAndWdsaWZ5T3B0aW9ucycgaW4gc2V0dGluZ3MgPyBzZXR0aW5ncy51Z2xpZnlPcHRpb25zIDoge307XG4gICAgICAgIG9wdGlvbnMuZnJvbVN0cmluZyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHVnbGlmeWluZ0VuYWJsZWQgPSAndWdsaWZ5JyBpbiBzZXR0aW5ncyAmJiAhIXNldHRpbmdzLnVnbGlmeTtcblxuICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5IGByZWlmeWAgd2lsbCBub3Qgd29yayB3aGVuIHdlIHJlcXVpcmUgYSAuanMgZmlsZSBmcm9tIGFuIGFzYXIgYXJjaGl2ZS5cbiAgICAgICAgLy8gU28gaGVyZSB3ZSB3aWxsIHRyYW5zcGlsZSAuZGVza3RvcCB0byBoYXZlIHRoZSBFUzYgbW9kdWxlcyB3b3JraW5nLlxuXG4gICAgICAgIC8vIFVnbGlmeSBkb2VzIG5vdCBoYW5kbGUgRVM2IHlldCwgc28gd2Ugd2lsbCBoYXZlIHRvIHRyYW5zcGlsZSB0byBFUzUgZm9yIG5vdy5cbiAgICAgICAgY29uc3QgcHJlc2V0ID0gKHVnbGlmeWluZ0VuYWJsZWQgJiYgc2V0dGluZ3MuZW52ID09PSAncHJvZCcpID9cbiAgICAgICAgICAgIGVzMjAxNVByZXNldCA6IG5vZGU2UHJlc2V0O1xuXG4gICAgICAgIGdsb2Iuc3luYyhgJHt0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3BUbXAucm9vdH0vKiovKi5qc2ApLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgIGxldCB7IGNvZGUgfSA9IHRyYW5zZm9ybUZpbGVTeW5jKGZpbGUsIHtcbiAgICAgICAgICAgICAgICBwcmVzZXRzOiBbcHJlc2V0XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZW52ID09PSAncHJvZCcgJiYgdWdsaWZ5aW5nRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvZGUgPSB1Z2xpZnkubWluaWZ5KGNvZGUsIG9wdGlvbnMpLmNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGNvZGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBhbGwgdGhlIGZpbGVzIHRoYXQgc2hvdWxkIG5vdCBiZSBwYWNrZWQgaW50byBhc2FyIGludG8gYSBzYWZlIGxvY2F0aW9uIHdoaWNoIGlzIHRoZVxuICAgICAqICdleHRyYWN0ZWQnIGRpciBpbiB0aGUgZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIGFzeW5jIGV4Y2x1ZGVGaWxlc0Zyb21BcmNoaXZlKCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdleGNsdWRpbmcgZmlsZXMgZnJvbSBwYWNraW5nJyk7XG5cbiAgICAgICAgLy8gRW5zdXJlIGVtcHR5IGBleHRyYWN0ZWRgIGRpclxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLiQudXRpbHMucm1XaXRoUmV0cmllcygnLXJmJywgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5leHRyYWN0ZWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzaGVsbC5ta2Rpcih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZCk7XG5cbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuJC5kZXNrdG9wLmdhdGhlck1vZHVsZUNvbmZpZ3MoKTtcblxuICAgICAgICAvLyBNb3ZlIGZpbGVzIHRoYXQgc2hvdWxkIG5vdCBiZSBhc2FyJ2VkLlxuICAgICAgICBjb25maWdzLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlQ29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgaWYgKCdleHRyYWN0JyBpbiBtb2R1bGVDb25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobW9kdWxlQ29uZmlnLmV4dHJhY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUNvbmZpZy5leHRyYWN0ID0gW21vZHVsZUNvbmZpZy5leHRyYWN0XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbW9kdWxlQ29uZmlnLmV4dHJhY3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhgZXhjbHVkaW5nICR7ZmlsZX0gZnJvbSAke2NvbmZpZy5uYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcFRtcC5tb2R1bGVzLCBtb2R1bGVDb25maWcuZGlyTmFtZSwgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkLCBtb2R1bGVDb25maWcuZGlyTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLiQudXRpbHMuZXhpc3RzKGRlc3RpbmF0aW9uUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsLm1rZGlyKGRlc3RpbmF0aW9uUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2hlbGwubXYoZmlsZVBhdGgsIGRlc3RpbmF0aW9uUGF0aCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==