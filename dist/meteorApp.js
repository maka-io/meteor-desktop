'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _singleLineLog = require('single-line-log');

var _singleLineLog2 = _interopRequireDefault(_singleLineLog);

var _asar = require('asar');

var _asar2 = _interopRequireDefault(_asar);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _isDesktopInjector = require('../skeleton/modules/autoupdate/isDesktopInjector');

var _isDesktopInjector2 = _interopRequireDefault(_isDesktopInjector);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _meteorManager = require('./meteorManager');

var _meteorManager2 = _interopRequireDefault(_meteorManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var join = _path2.default.join;

var sll = _singleLineLog2.default.stdout;

// TODO: refactor all strategy ifs to one place

/**
 * Represents the Meteor app.
 * @property {MeteorDesktop} $
 * @class
 */

var MeteorApp = function () {

    /**
     * @param {MeteorDesktop} $ - context
     * @constructor
     */
    function MeteorApp($) {
        (0, _classCallCheck3.default)(this, MeteorApp);

        this.log = new _log2.default('meteorApp');
        this.$ = $;
        this.meteorManager = new _meteorManager2.default($);
        this.mobilePlatform = null;
        this.oldManifest = null;
        this.injector = new _isDesktopInjector2.default();
        this.matcher = new RegExp('__meteor_runtime_config__ = JSON.parse\\(decodeURIComponent\\("([^"]*)"\\)\\)');
        this.replacer = new RegExp('(__meteor_runtime_config__ = JSON.parse\\(decodeURIComponent\\()"([^"]*)"(\\)\\))');
        this.meteorVersion = null;
        this.indexHTMLstrategy = null;

        this.indexHTMLStrategies = {
            INDEX_FROM_CORDOVA_BUILD: 1,
            INDEX_FROM_RUNNING_SERVER: 2
        };
    }

    /**
     * Ensures that required packages are added to the Meteor app.
     */


    (0, _createClass3.default)(MeteorApp, [{
        key: 'ensureDesktopHCPPackages',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this = this;

                var desktopHCPPackages, packagesWithVersion;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                desktopHCPPackages = ['omega:meteor-desktop-watcher', 'omega:meteor-desktop-bundler'];

                                if (!this.$.desktop.getSettings().desktopHCP) {
                                    _context.next = 14;
                                    break;
                                }

                                this.log.verbose('desktopHCP is enabled, checking for required packages');

                                packagesWithVersion = desktopHCPPackages.map(function (packageName) {
                                    return packageName + '@' + _this.$.getVersion();
                                });
                                _context.prev = 4;
                                _context.next = 7;
                                return this.meteorManager.ensurePackages(desktopHCPPackages, packagesWithVersion, 'desktopHCP');

                            case 7:
                                _context.next = 12;
                                break;

                            case 9:
                                _context.prev = 9;
                                _context.t0 = _context['catch'](4);
                                throw new Error(_context.t0);

                            case 12:
                                _context.next = 24;
                                break;

                            case 14:
                                this.log.verbose('desktopHCP is not enabled, removing required packages');

                                _context.prev = 15;

                                if (!this.meteorManager.checkPackages(desktopHCPPackages)) {
                                    _context.next = 19;
                                    break;
                                }

                                _context.next = 19;
                                return this.meteorManager.deletePackages(desktopHCPPackages, 'desktopHCP');

                            case 19:
                                _context.next = 24;
                                break;

                            case 21:
                                _context.prev = 21;
                                _context.t1 = _context['catch'](15);
                                throw new Error(_context.t1);

                            case 24:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[4, 9], [15, 21]]);
            }));

            function ensureDesktopHCPPackages() {
                return _ref.apply(this, arguments);
            }

            return ensureDesktopHCPPackages;
        }()

        /**
         * Adds entry to .meteor/.gitignore if necessary.
         */

    }, {
        key: 'updateGitIgnore',
        value: function updateGitIgnore() {
            this.log.verbose('updating .meteor/.gitignore');
            // Lets read the .meteor/.gitignore and filter out blank lines.
            var gitIgnore = _fs2.default.readFileSync(this.$.env.paths.meteorApp.gitIgnore, 'UTF-8').split('\n').filter(function (ignoredPath) {
                return ignoredPath.trim() !== '';
            });

            if (!~gitIgnore.indexOf(this.$.env.paths.electronApp.rootName)) {
                this.log.verbose('adding ' + this.$.env.paths.electronApp.rootName + ' to .meteor/.gitignore');
                gitIgnore.push(this.$.env.paths.electronApp.rootName);

                _fs2.default.writeFileSync(this.$.env.paths.meteorApp.gitIgnore, gitIgnore.join('\n'), 'UTF-8');
            }
        }

        /**
         * Reads the Meteor release version used in the app.
         * @returns {string}
         */

    }, {
        key: 'getMeteorRelease',
        value: function getMeteorRelease() {
            var release = _fs2.default.readFileSync(this.$.env.paths.meteorApp.release, 'UTF-8').split('\n')[0];
            release = release.split('@')[1];
            // We do not care if it is beta.
            if (~release.indexOf('-')) {
                release = release.split('-')[0];
            }
            return release;
        }

        /**
         * Cast Meteor release to semver version.
         * @returns {string}
         */

    }, {
        key: 'castMeteorReleaseToSemver',
        value: function castMeteorReleaseToSemver() {
            return (this.getMeteorRelease() + '.0.0').match(/(^\d+\.\d+\.\d+)/gmi)[0];
        }

        /**
         * Validate meteor version against a versionRange.
         * @param {string} versionRange - semver version range
         */

    }, {
        key: 'checkMeteorVersion',
        value: function checkMeteorVersion(versionRange) {
            var release = this.castMeteorReleaseToSemver();
            if (!_semver2.default.satisfies(release, versionRange)) {
                if (this.$.env.options.skipMobileBuild) {
                    this.log.error('wrong meteor version (' + release + ') in project - only ' + (versionRange + ' is supported'));
                } else {
                    this.log.error('wrong meteor version (' + release + ') in project - only ' + (versionRange + ' is supported for automatic meteor builds (you can always ') + 'try with `--skip-mobile-build` if you are using meteor >= 1.2.1');
                }
                process.exit(1);
            }
        }

        /**
         * Decides which strategy to use while trying to get client build out of Meteor project.
         * @returns {number}
         */

    }, {
        key: 'chooseStrategy',
        value: function chooseStrategy() {
            if (this.$.env.options.forceCordovaBuild) {
                return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
            }

            var release = this.castMeteorReleaseToSemver();
            if (_semver2.default.satisfies(release, '> 1.3.4')) {
                return this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER;
            }
            if (_semver2.default.satisfies(release, '1.3.4')) {
                var explodedVersion = this.getMeteorRelease().split('.');
                if (explodedVersion.length >= 4) {
                    if (explodedVersion[3] > 1) {
                        return this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER;
                    }
                    return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
                }
            }
            return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
        }

        /**
         * Checks required preconditions.
         * - Meteor version
         * - is mobile platform added
         */

    }, {
        key: 'checkPreconditions',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var platforms;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (this.$.env.options.skipMobileBuild) {
                                    this.checkMeteorVersion('>= 1.2.1');
                                } else {
                                    this.checkMeteorVersion('>= 1.3.3');
                                    this.indexHTMLstrategy = this.chooseStrategy();
                                    if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
                                        this.log.debug('meteor version is < 1.3.4.2 so the index.html from cordova-build will' + ' be used');
                                    } else {
                                        this.log.debug('meteor version is >= 1.3.4.2 so the index.html will be downloaded ' + 'from __cordova/index.html');
                                    }
                                }

                                if (this.$.env.options.skipMobileBuild) {
                                    _context2.next = 15;
                                    break;
                                }

                                platforms = _fs2.default.readFileSync(this.$.env.paths.meteorApp.platforms, 'UTF-8');

                                if (!(!~platforms.indexOf('android') && !~platforms.indexOf('ios'))) {
                                    _context2.next = 15;
                                    break;
                                }

                                if (!this.$.env.options.android) {
                                    this.mobilePlatform = 'ios';
                                } else {
                                    this.mobilePlatform = 'android';
                                }
                                this.log.warn('no mobile target detected - will add \'' + this.mobilePlatform + '\' ' + 'just to get a mobile build');
                                _context2.prev = 6;
                                _context2.next = 9;
                                return this.addMobilePlatform(this.mobilePlatform);

                            case 9:
                                _context2.next = 15;
                                break;

                            case 11:
                                _context2.prev = 11;
                                _context2.t0 = _context2['catch'](6);

                                this.log.error('failed to add a mobile platform - please try to do it manually');
                                process.exit(1);

                            case 15:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 11]]);
            }));

            function checkPreconditions() {
                return _ref2.apply(this, arguments);
            }

            return checkPreconditions;
        }()

        /**
         * Tries to add a mobile platform to meteor project.
         * @param {string} platform - platform to add
         * @returns {Promise}
         */

    }, {
        key: 'addMobilePlatform',
        value: function addMobilePlatform(platform) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                _this2.log.verbose('adding mobile platform: ' + platform);
                (0, _crossSpawn2.default)('meteor', ['add-platform', platform], {
                    cwd: _this2.$.env.paths.meteorApp.root,
                    stdio: _this2.$.env.stdio
                }).on('exit', function () {
                    var platforms = _fs2.default.readFileSync(_this2.$.env.paths.meteorApp.platforms, 'UTF-8');
                    if (!~platforms.indexOf('android') && !~platforms.indexOf('ios')) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }

        /**
         * Tries to remove a mobile platform from meteor project.
         * @param {string} platform - platform to remove
         * @returns {Promise}
         */

    }, {
        key: 'removeMobilePlatform',
        value: function removeMobilePlatform(platform) {
            var _this3 = this;

            return new _promise2.default(function (resolve, reject) {
                _this3.log.verbose('removing mobile platform: ' + platform);
                (0, _crossSpawn2.default)('meteor', ['remove-platform', platform], {
                    cwd: _this3.$.env.paths.meteorApp.root,
                    stdio: _this3.$.env.stdio,
                    env: (0, _assign2.default)({ METEOR_PRETTY_OUTPUT: 0 }, process.env)
                }).on('exit', function () {
                    var platforms = _fs2.default.readFileSync(_this3.$.env.paths.meteorApp.platforms, 'UTF-8');
                    if (~platforms.indexOf(platform)) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }

        /**
         * Just checks for index.html and program.json existence.
         * @returns {boolean}
         */

    }, {
        key: 'isCordovaBuildReady',
        value: function isCordovaBuildReady() {
            if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
                return this.$.utils.exists(this.$.env.paths.meteorApp.cordovaBuildIndex) && this.$.utils.exists(this.$.env.paths.meteorApp.cordovaBuildProgramJson) && (!this.oldManifest || this.oldManifest && this.oldManifest !== _fs2.default.readFileSync(this.$.env.paths.meteorApp.cordovaBuildProgramJson, 'UTF-8'));
            }
            return this.$.utils.exists(this.$.env.paths.meteorApp.webCordovaProgramJson) && (!this.oldManifest || this.oldManifest && this.oldManifest !== _fs2.default.readFileSync(this.$.env.paths.meteorApp.webCordovaProgramJson, 'UTF-8'));
        }

        /**
         * Fetches index.html from running project.
         * @returns {Promise.<*>}
         */

    }, {
        key: 'acquireIndex',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var port, res, text;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                port = this.$.env.options.port ? this.$.env.options.port : 3080;

                                this.log.info('acquiring index.html');
                                _context3.next = 4;
                                return (0, _nodeFetch2.default)('http://127.0.0.1:' + port + '/__cordova/index.html');

                            case 4:
                                res = _context3.sent;
                                _context3.next = 7;
                                return res.text();

                            case 7:
                                text = _context3.sent;

                                if (!~text.indexOf('src="/cordova.js"')) {
                                    _context3.next = 10;
                                    break;
                                }

                                return _context3.abrupt('return', text);

                            case 10:
                                return _context3.abrupt('return', false);

                            case 11:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function acquireIndex() {
                return _ref3.apply(this, arguments);
            }

            return acquireIndex;
        }()

        /**
         * Fetches mainfest.json from running project.
         * @returns {Promise.<void>}
         */

    }, {
        key: 'acquireManifest',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var port, res, text;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                port = this.$.env.options.port ? this.$.env.options.port : 3080;

                                this.log.info('acquiring manifest.json');
                                _context4.next = 4;
                                return (0, _nodeFetch2.default)('http://127.0.0.1:' + port + '/__cordova/manifest.json?meteor_dont_serve_index=true');

                            case 4:
                                res = _context4.sent;
                                _context4.next = 7;
                                return res.text();

                            case 7:
                                text = _context4.sent;
                                return _context4.abrupt('return', JSON.parse(text));

                            case 9:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function acquireManifest() {
                return _ref4.apply(this, arguments);
            }

            return acquireManifest;
        }()

        /**
         * Tries to get a mobile build from meteor app.
         * In case of failure leaves a meteor.log.
         * A lot of stuff is happening here - but the main aim is to get a mobile build from
         * .meteor/local/cordova-build/www/application and exit as soon as possible.
         *
         * @returns {Promise}
         */

    }, {
        key: 'buildMobileTarget',
        value: function buildMobileTarget() {
            var _this4 = this;

            var programJson = this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD ? this.$.env.paths.meteorApp.cordovaBuildProgramJson : this.$.env.paths.meteorApp.webCordovaProgramJson;

            if (this.$.utils.exists(programJson)) {
                this.oldManifest = _fs2.default.readFileSync(programJson, 'UTF-8');
            }

            return new _promise2.default(function (resolve, reject) {
                var self = _this4;
                var log = '';
                var desiredExit = false;
                var buildTimeout = null;
                var errorTimeout = null;
                var messageTimeout = null;
                var killTimeout = null;
                var cordovaCheckInterval = null;
                var portProblem = false;

                function windowsKill(pid) {
                    self.log.debug('killing pid: ' + pid);
                    _crossSpawn2.default.sync('taskkill', ['/pid', pid, '/f', '/t']);

                    // We will look for other process which might have been created outside the
                    // process tree.
                    // Lets list all node.exe processes.
                    var out = _crossSpawn2.default.sync('wmic', ['process', 'where', 'caption="node.exe"', 'get', 'commandline,processid']).stdout.toString('utf-8').split('\n');
                    var args = self.prepareArguments();
                    // Lets mount regex.
                    var regexV1 = new RegExp(args.join('\\s+') + '\\s+(\\d+)', 'gm');
                    var regexV2 = new RegExp('"' + args.join('"\\s+"') + '"\\s+(\\d+)', 'gm');
                    // No we will check for those with the matching params.
                    out.forEach(function (line) {
                        var match = regexV1.exec(line) || regexV2.exec(line) || false;
                        if (match) {
                            self.log.debug('killing pid: ' + match[1]);
                            _crossSpawn2.default.sync('taskkill', ['/pid', match[1], '/f', '/t']);
                        }
                    });
                }

                function writeLog() {
                    _fs2.default.writeFileSync('meteor.log', log, 'UTF-8');
                }

                function clearTimeoutsAndIntervals() {
                    clearInterval(cordovaCheckInterval);
                    clearTimeout(buildTimeout);
                    clearTimeout(errorTimeout);
                    clearTimeout(messageTimeout);
                    clearTimeout(killTimeout);
                }

                var args = _this4.prepareArguments();

                _this4.log.info('running "meteor ' + args.join(' ') + '"... this might take a while');

                // Lets spawn meteor.
                var child = (0, _crossSpawn2.default)('meteor', args, {
                    env: (0, _assign2.default)({ METEOR_PRETTY_OUTPUT: 0, METEOR_NO_RELEASE_CHECK: 1 }, process.env),
                    cwd: _this4.$.env.paths.meteorApp.root
                }, { shell: true });

                // Kills the currently running meteor command.
                function kill() {
                    sll('');
                    child.kill('SIGKILL');
                    if (self.$.env.os.isWindows) {
                        windowsKill(child.pid);
                    }
                }

                function exit() {
                    killTimeout = setTimeout(function () {
                        clearTimeoutsAndIntervals();
                        desiredExit = true;
                        kill();
                        resolve();
                    }, 500);
                }

                function copyBuild() {
                    self.copyBuild().then(function () {
                        exit();
                    }).catch(function () {
                        clearTimeoutsAndIntervals();
                        kill();
                        writeLog();
                        reject('copy');
                    });
                }

                cordovaCheckInterval = setInterval(function () {
                    // Check if we already have cordova-build ready.
                    if (_this4.isCordovaBuildReady()) {
                        // If so, then exit immediately.
                        if (_this4.indexHTMLstrategy === _this4.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
                            copyBuild();
                        }
                    }
                }, 1000);

                child.stderr.on('data', function (chunk) {
                    var line = chunk.toString('UTF-8');
                    log += line + '\n';
                    if (errorTimeout) {
                        clearTimeout(errorTimeout);
                    }
                    // Do not exit if this is the warning for using --production.
                    // Output exceeds -> https://github.com/meteor/meteor/issues/8592
                    if (!~line.indexOf('--production') && !~line.indexOf('Output exceeds ')) {
                        // We will exit 1s after last error in stderr.
                        errorTimeout = setTimeout(function () {
                            clearTimeoutsAndIntervals();
                            kill();
                            writeLog();
                            reject('error');
                        }, 1000);
                    }
                });

                child.stdout.on('data', function (chunk) {
                    var line = chunk.toString('UTF-8');
                    if (!desiredExit && line.trim().replace(/[\n\r\t\v\f]+/gm, '') !== '') {
                        var linesToDisplay = line.trim().split('\n\r');
                        // Only display last line from the chunk.
                        var sanitizedLine = linesToDisplay.pop().replace(/[\n\r\t\v\f]+/gm, '');
                        sll(sanitizedLine);
                    }
                    log += line + '\n';
                    if (~line.indexOf('after_platform_add')) {
                        sll('');
                        _this4.log.info('done... 10%');
                    }

                    if (~line.indexOf('Local package version')) {
                        if (messageTimeout) {
                            clearTimeout(messageTimeout);
                        }
                        messageTimeout = setTimeout(function () {
                            sll('');
                            _this4.log.info('building in progress...');
                        }, 1500);
                    }

                    if (~line.indexOf('Preparing Cordova project')) {
                        sll('');
                        _this4.log.info('done... 60%');
                    }

                    if (~line.indexOf('Can\'t listen on port')) {
                        portProblem = true;
                    }

                    if (~line.indexOf('Your application has errors')) {
                        if (errorTimeout) {
                            clearTimeout(errorTimeout);
                        }
                        errorTimeout = setTimeout(function () {
                            clearTimeoutsAndIntervals();
                            kill();
                            writeLog();
                            reject('errorInApp');
                        }, 1000);
                    }

                    if (~line.indexOf('App running at')) {
                        copyBuild();
                    }
                });

                // When Meteor exits
                child.on('exit', function () {
                    sll('');
                    clearTimeoutsAndIntervals();
                    if (!desiredExit) {
                        writeLog();
                        if (portProblem) {
                            reject('port');
                        } else {
                            reject('exit');
                        }
                    }
                });

                buildTimeout = setTimeout(function () {
                    kill();
                    writeLog();
                    reject('timeout');
                }, _this4.$.env.options.buildTimeout ? _this4.$.env.options.buildTimeout * 1000 : 600000);
            });
        }

        /**
         * Replaces the DDP url that was used originally when Meteor was building the client.
         * @param {string} indexHtml - path to index.html from the client
         */

    }, {
        key: 'updateDdpUrl',
        value: function updateDdpUrl(indexHtml) {
            var content = void 0;
            var runtimeConfig = void 0;

            try {
                content = _fs2.default.readFileSync(indexHtml, 'UTF-8');
            } catch (e) {
                this.log.error('error loading index.html file: ' + e.message);
                process.exit(1);
            }
            if (!this.matcher.test(content)) {
                this.log.error('could not find runtime config in index file');
                process.exit(1);
            }

            try {
                var matches = content.match(this.matcher);
                runtimeConfig = JSON.parse(decodeURIComponent(matches[1]));
            } catch (e) {
                this.log.error('could not find runtime config in index file');
                process.exit(1);
            }

            if (this.$.env.options.ddpUrl.substr(-1, 1) !== '/') {
                this.$.env.options.ddpUrl += '/';
            }

            runtimeConfig.ROOT_URL = this.$.env.options.ddpUrl;
            runtimeConfig.DDP_DEFAULT_CONNECTION_URL = this.$.env.options.ddpUrl;

            content = content.replace(this.replacer, '$1"' + encodeURIComponent((0, _stringify2.default)(runtimeConfig)) + '"$3');

            try {
                _fs2.default.writeFileSync(indexHtml, content);
            } catch (e) {
                this.log.error('error writing index.html file: ' + e.message);
                process.exit(1);
            }
            this.log.info('successfully updated ddp string in the runtime config of a mobile build' + (' to ' + this.$.env.options.ddpUrl));
        }

        /**
         * Prepares the arguments passed to `meteor` command.
         * @returns {string[]}
         */

    }, {
        key: 'prepareArguments',
        value: function prepareArguments() {
            var args = ['run', '--verbose', '--mobile-server=' + this.$.env.options.ddpUrl];
            if (this.$.env.isProductionBuild()) {
                args.push('--production');
            }
            args.push('-p');
            if (this.$.env.options.port) {
                args.push(this.$.env.options.port);
            } else {
                args.push('3080');
            }
            if (this.$.env.options.meteorSettings) {
                args.push('--settings', this.$.env.options.meteorSettings);
            }
            return args;
        }

        /**
         * Validates the mobile build and copies it into electron app.
         */

    }, {
        key: 'copyBuild',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                var prefix, copyPathPostfix, indexHtml, cordovaBuild, cordovaBuildIndex, cordovaBuildProgramJson, programJson;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                this.log.debug('clearing build dir');
                                _context5.prev = 1;
                                _context5.next = 4;
                                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.meteorApp);

                            case 4:
                                _context5.next = 9;
                                break;

                            case 6:
                                _context5.prev = 6;
                                _context5.t0 = _context5['catch'](1);
                                throw new Error(_context5.t0);

                            case 9:
                                prefix = 'cordovaBuild';
                                copyPathPostfix = '';

                                if (!(this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                                    _context5.next = 28;
                                    break;
                                }

                                prefix = 'webCordova';
                                copyPathPostfix = _path2.default.sep + '*';
                                indexHtml = void 0;
                                _context5.prev = 15;

                                _fs2.default.mkdir(this.$.env.paths.electronApp.meteorApp);
                                _context5.next = 19;
                                return this.acquireIndex();

                            case 19:
                                indexHtml = _context5.sent;

                                _fs2.default.writeFileSync(this.$.env.paths.electronApp.meteorAppIndex, indexHtml);
                                this.log.info('successfully downloaded index.html from running meteor app');
                                _context5.next = 28;
                                break;

                            case 24:
                                _context5.prev = 24;
                                _context5.t1 = _context5['catch'](15);

                                this.log.error('error while trying to download index.html for web.cordova, ' + 'be sure that you are running a mobile target or with' + ' --mobile-server: ', _context5.t1);
                                throw _context5.t1;

                            case 28:
                                cordovaBuild = this.$.env.paths.meteorApp[prefix];
                                cordovaBuildIndex = this.$.env.paths.meteorApp.cordovaBuildIndex;
                                cordovaBuildProgramJson = this.$.env.paths.meteorApp[prefix + 'ProgramJson'];

                                if (this.$.utils.exists(cordovaBuild)) {
                                    _context5.next = 35;
                                    break;
                                }

                                this.log.error('no mobile build found at ' + cordovaBuild);
                                this.log.error('are you sure you did run meteor with --mobile-server?');
                                throw new Error('required file not present');

                            case 35:
                                if (this.$.utils.exists(cordovaBuildProgramJson)) {
                                    _context5.next = 39;
                                    break;
                                }

                                this.log.error('no program.json found in mobile build found at ' + ('' + cordovaBuild));
                                this.log.error('are you sure you did run meteor with --mobile-server?');
                                throw new Error('required file not present');

                            case 39:
                                if (!(this.indexHTMLstrategy !== this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                                    _context5.next = 44;
                                    break;
                                }

                                if (this.$.utils.exists(cordovaBuildIndex)) {
                                    _context5.next = 44;
                                    break;
                                }

                                this.log.error('no index.html found in cordova build found at ' + ('' + cordovaBuild));
                                this.log.error('are you sure you did run meteor with --mobile-server?');
                                throw new Error('required file not present');

                            case 44:

                                this.log.verbose('copying mobile build');
                                _shelljs2.default.cp('-R', '' + cordovaBuild + copyPathPostfix, this.$.env.paths.electronApp.meteorApp);

                                // Because of various permission problems here we try to clear te path by clearing
                                // all possible restrictions.
                                _shelljs2.default.chmod('-R', '777', this.$.env.paths.electronApp.meteorApp);
                                if (this.$.env.os.isWindows) {
                                    _shelljs2.default.exec('attrib -r ' + this.$.env.paths.electronApp.meteorApp + _path2.default.sep + '*.* /s');
                                }

                                if (!(this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                                    _context5.next = 62;
                                    break;
                                }

                                programJson = void 0;
                                _context5.prev = 50;
                                _context5.next = 53;
                                return this.acquireManifest();

                            case 53:
                                programJson = _context5.sent;

                                _fs2.default.writeFileSync(this.$.env.paths.electronApp.meteorAppProgramJson, (0, _stringify2.default)(programJson, null, 4));
                                this.log.info('successfully downloaded manifest.json from running meteor app');
                                _context5.next = 62;
                                break;

                            case 58:
                                _context5.prev = 58;
                                _context5.t2 = _context5['catch'](50);

                                this.log.error('error while trying to download manifest.json for web.cordova,' + ' be sure that you are running a mobile target or with' + ' --mobile-server: ', _context5.t2);
                                throw _context5.t2;

                            case 62:

                                this.log.info('mobile build copied to electron app');

                                this.log.debug('copy cordova.js to meteor build');
                                _shelljs2.default.cp(join(__dirname, '..', 'skeleton', 'cordova.js'), this.$.env.paths.electronApp.meteorApp);

                            case 65:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[1, 6], [15, 24], [50, 58]]);
            }));

            function copyBuild() {
                return _ref5.apply(this, arguments);
            }

            return copyBuild;
        }()

        /**
         * Injects Meteor.isDesktop
         */

    }, {
        key: 'injectIsDesktop',
        value: function injectIsDesktop() {
            var _this5 = this;

            this.log.info('injecting isDesktop');

            var manifestJsonPath = this.$.env.paths.meteorApp.cordovaBuildProgramJson;
            if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER) {
                manifestJsonPath = this.$.env.paths.meteorApp.webCordovaProgramJson;
            }

            try {
                var manifest = JSON.parse(_fs2.default.readFileSync(manifestJsonPath, 'UTF-8')).manifest;
                var injected = false;
                var injectedStartupDidComplete = false;
                var result = null;

                // We will search in every .js file in the manifest.
                // We could probably detect whether this is a dev or production build and only search in
                // the correct files, but for now this should be fine.
                manifest.forEach(function (file) {
                    var fileContents = void 0;
                    // Hacky way of setting isDesktop.
                    if (file.type === 'js') {
                        fileContents = _fs2.default.readFileSync(join(_this5.$.env.paths.electronApp.meteorApp, file.path), 'UTF-8');
                        result = _this5.injector.processFileContents(fileContents);

                        fileContents = result.fileContents;
                        injectedStartupDidComplete = result.injectedStartupDidComplete ? true : injectedStartupDidComplete;
                        injected = result.injected ? true : injected;

                        _fs2.default.writeFileSync(join(_this5.$.env.paths.electronApp.meteorApp, file.path), fileContents);
                    }
                });

                if (!injected) {
                    this.log.error('error injecting isDesktop global var.');
                    process.exit(1);
                }
                if (!injectedStartupDidComplete) {
                    this.log.error('error injecting isDesktop for startupDidComplete');
                    process.exit(1);
                }
            } catch (e) {
                this.log.error('error occurred while injecting isDesktop: ', e);
                process.exit(1);
            }
            this.log.info('injected successfully');
        }

        /**
         * Builds, modifies and copies the meteor app to electron app.
         */

    }, {
        key: 'build',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                this.log.info('checking for any mobile platform');
                                _context6.prev = 1;
                                _context6.next = 4;
                                return this.checkPreconditions();

                            case 4:
                                _context6.next = 10;
                                break;

                            case 6:
                                _context6.prev = 6;
                                _context6.t0 = _context6['catch'](1);

                                this.log.error('error occurred during checking preconditions: ', _context6.t0);
                                process.exit(1);

                            case 10:

                                this.log.info('building meteor app');

                                if (this.$.env.options.skipMobileBuild) {
                                    _context6.next = 41;
                                    break;
                                }

                                _context6.prev = 12;
                                _context6.next = 15;
                                return this.buildMobileTarget();

                            case 15:
                                _context6.next = 39;
                                break;

                            case 17:
                                _context6.prev = 17;
                                _context6.t1 = _context6['catch'](12);
                                _context6.t2 = _context6.t1;
                                _context6.next = _context6.t2 === 'timeout' ? 22 : _context6.t2 === 'error' ? 24 : _context6.t2 === 'errorInApp' ? 26 : _context6.t2 === 'port' ? 28 : _context6.t2 === 'exit' ? 30 : _context6.t2 === 'copy' ? 32 : 34;
                                break;

                            case 22:
                                this.log.error('timeout while building, log has been written to meteor.log');
                                return _context6.abrupt('break', 35);

                            case 24:
                                this.log.error('some errors were reported during build, check meteor.log for more' + ' info');
                                return _context6.abrupt('break', 35);

                            case 26:
                                this.log.error('your meteor app has errors - look into meteor.log for more' + ' info');
                                return _context6.abrupt('break', 35);

                            case 28:
                                this.log.error('your port 3080 is currently used (you probably have this or other ' + 'meteor project running?), use `-t` or `--meteor-port` to use ' + 'different port while building');
                                return _context6.abrupt('break', 35);

                            case 30:
                                this.log.error('meteor cmd exited unexpectedly, log has been written to meteor.log');
                                return _context6.abrupt('break', 35);

                            case 32:
                                this.log.error('error encountered when copying the build');
                                return _context6.abrupt('break', 35);

                            case 34:
                                this.log.error('error occurred during building mobile target', _context6.t1);

                            case 35:
                                if (!this.mobilePlatform) {
                                    _context6.next = 38;
                                    break;
                                }

                                _context6.next = 38;
                                return this.removeMobilePlatform(this.mobilePlatform);

                            case 38:
                                process.exit(1);

                            case 39:
                                _context6.next = 50;
                                break;

                            case 41:
                                this.indexHTMLstrategy = this.chooseStrategy();
                                _context6.prev = 42;
                                _context6.next = 45;
                                return this.copyBuild();

                            case 45:
                                _context6.next = 50;
                                break;

                            case 47:
                                _context6.prev = 47;
                                _context6.t3 = _context6['catch'](42);

                                process.exit(1);

                            case 50:

                                this.injectIsDesktop();

                                this.changeDdpUrl();

                                _context6.prev = 52;
                                _context6.next = 55;
                                return this.packToAsar();

                            case 55:
                                _context6.next = 61;
                                break;

                            case 57:
                                _context6.prev = 57;
                                _context6.t4 = _context6['catch'](52);

                                this.log.error('error while packing meteor app to asar');
                                process.exit(1);

                            case 61:

                                this.log.info('meteor build finished');

                                if (!this.mobilePlatform) {
                                    _context6.next = 65;
                                    break;
                                }

                                _context6.next = 65;
                                return this.removeMobilePlatform(this.mobilePlatform);

                            case 65:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[1, 6], [12, 17], [42, 47], [52, 57]]);
            }));

            function build() {
                return _ref6.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'changeDdpUrl',
        value: function changeDdpUrl() {
            if (this.$.env.options.ddpUrl !== null) {
                try {
                    this.updateDdpUrl(this.$.env.paths.electronApp.meteorAppIndex);
                } catch (e) {
                    this.log.error('error while trying to change the ddp url: ' + e.message);
                }
            }
        }
    }, {
        key: 'packToAsar',
        value: function packToAsar() {
            var _this6 = this;

            this.log.info('packing meteor app to asar archive');
            return new _promise2.default(function (resolve, reject) {
                return _asar2.default.createPackage(_this6.$.env.paths.electronApp.meteorApp, _path2.default.join(_this6.$.env.paths.electronApp.root, 'meteor.asar'), function () {
                    // On Windows some files might still be blocked. Giving a tick for them to be
                    // ready for deletion.
                    (0, _setImmediate3.default)(function () {
                        _this6.log.verbose('clearing meteor app after packing');
                        _this6.$.utils.rmWithRetries('-rf', _this6.$.env.paths.electronApp.meteorApp).then(function () {
                            resolve();
                        }).catch(function (e) {
                            reject(e);
                        });
                    });
                });
            });
        }
    }]);
    return MeteorApp;
}();

exports.default = MeteorApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9tZXRlb3JBcHAuanMiXSwibmFtZXMiOlsiam9pbiIsInNsbCIsInN0ZG91dCIsIk1ldGVvckFwcCIsIiQiLCJsb2ciLCJtZXRlb3JNYW5hZ2VyIiwibW9iaWxlUGxhdGZvcm0iLCJvbGRNYW5pZmVzdCIsImluamVjdG9yIiwibWF0Y2hlciIsIlJlZ0V4cCIsInJlcGxhY2VyIiwibWV0ZW9yVmVyc2lvbiIsImluZGV4SFRNTHN0cmF0ZWd5IiwiaW5kZXhIVE1MU3RyYXRlZ2llcyIsIklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCIsIklOREVYX0ZST01fUlVOTklOR19TRVJWRVIiLCJkZXNrdG9wSENQUGFja2FnZXMiLCJkZXNrdG9wIiwiZ2V0U2V0dGluZ3MiLCJkZXNrdG9wSENQIiwidmVyYm9zZSIsInBhY2thZ2VzV2l0aFZlcnNpb24iLCJtYXAiLCJwYWNrYWdlTmFtZSIsImdldFZlcnNpb24iLCJlbnN1cmVQYWNrYWdlcyIsIkVycm9yIiwiY2hlY2tQYWNrYWdlcyIsImRlbGV0ZVBhY2thZ2VzIiwiZ2l0SWdub3JlIiwicmVhZEZpbGVTeW5jIiwiZW52IiwicGF0aHMiLCJtZXRlb3JBcHAiLCJzcGxpdCIsImZpbHRlciIsImlnbm9yZWRQYXRoIiwidHJpbSIsImluZGV4T2YiLCJlbGVjdHJvbkFwcCIsInJvb3ROYW1lIiwicHVzaCIsIndyaXRlRmlsZVN5bmMiLCJyZWxlYXNlIiwiZ2V0TWV0ZW9yUmVsZWFzZSIsIm1hdGNoIiwidmVyc2lvblJhbmdlIiwiY2FzdE1ldGVvclJlbGVhc2VUb1NlbXZlciIsInNhdGlzZmllcyIsIm9wdGlvbnMiLCJza2lwTW9iaWxlQnVpbGQiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiZm9yY2VDb3Jkb3ZhQnVpbGQiLCJleHBsb2RlZFZlcnNpb24iLCJsZW5ndGgiLCJjaGVja01ldGVvclZlcnNpb24iLCJjaG9vc2VTdHJhdGVneSIsImRlYnVnIiwicGxhdGZvcm1zIiwiYW5kcm9pZCIsIndhcm4iLCJhZGRNb2JpbGVQbGF0Zm9ybSIsInBsYXRmb3JtIiwicmVzb2x2ZSIsInJlamVjdCIsImN3ZCIsInJvb3QiLCJzdGRpbyIsIm9uIiwiTUVURU9SX1BSRVRUWV9PVVRQVVQiLCJ1dGlscyIsImV4aXN0cyIsImNvcmRvdmFCdWlsZEluZGV4IiwiY29yZG92YUJ1aWxkUHJvZ3JhbUpzb24iLCJ3ZWJDb3Jkb3ZhUHJvZ3JhbUpzb24iLCJwb3J0IiwiaW5mbyIsInJlcyIsInRleHQiLCJKU09OIiwicGFyc2UiLCJwcm9ncmFtSnNvbiIsInNlbGYiLCJkZXNpcmVkRXhpdCIsImJ1aWxkVGltZW91dCIsImVycm9yVGltZW91dCIsIm1lc3NhZ2VUaW1lb3V0Iiwia2lsbFRpbWVvdXQiLCJjb3Jkb3ZhQ2hlY2tJbnRlcnZhbCIsInBvcnRQcm9ibGVtIiwid2luZG93c0tpbGwiLCJwaWQiLCJzeW5jIiwib3V0IiwidG9TdHJpbmciLCJhcmdzIiwicHJlcGFyZUFyZ3VtZW50cyIsInJlZ2V4VjEiLCJyZWdleFYyIiwiZm9yRWFjaCIsImxpbmUiLCJleGVjIiwid3JpdGVMb2ciLCJjbGVhclRpbWVvdXRzQW5kSW50ZXJ2YWxzIiwiY2xlYXJJbnRlcnZhbCIsImNsZWFyVGltZW91dCIsImNoaWxkIiwiTUVURU9SX05PX1JFTEVBU0VfQ0hFQ0siLCJzaGVsbCIsImtpbGwiLCJvcyIsImlzV2luZG93cyIsInNldFRpbWVvdXQiLCJjb3B5QnVpbGQiLCJ0aGVuIiwiY2F0Y2giLCJzZXRJbnRlcnZhbCIsImlzQ29yZG92YUJ1aWxkUmVhZHkiLCJzdGRlcnIiLCJjaHVuayIsInJlcGxhY2UiLCJsaW5lc1RvRGlzcGxheSIsInNhbml0aXplZExpbmUiLCJwb3AiLCJpbmRleEh0bWwiLCJjb250ZW50IiwicnVudGltZUNvbmZpZyIsImUiLCJtZXNzYWdlIiwidGVzdCIsIm1hdGNoZXMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJkZHBVcmwiLCJzdWJzdHIiLCJST09UX1VSTCIsIkREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiaXNQcm9kdWN0aW9uQnVpbGQiLCJtZXRlb3JTZXR0aW5ncyIsInJtV2l0aFJldHJpZXMiLCJwcmVmaXgiLCJjb3B5UGF0aFBvc3RmaXgiLCJzZXAiLCJta2RpciIsImFjcXVpcmVJbmRleCIsIm1ldGVvckFwcEluZGV4IiwiY29yZG92YUJ1aWxkIiwiY3AiLCJjaG1vZCIsImFjcXVpcmVNYW5pZmVzdCIsIm1ldGVvckFwcFByb2dyYW1Kc29uIiwiX19kaXJuYW1lIiwibWFuaWZlc3RKc29uUGF0aCIsIm1hbmlmZXN0IiwiaW5qZWN0ZWQiLCJpbmplY3RlZFN0YXJ0dXBEaWRDb21wbGV0ZSIsInJlc3VsdCIsImZpbGUiLCJmaWxlQ29udGVudHMiLCJ0eXBlIiwicGF0aCIsInByb2Nlc3NGaWxlQ29udGVudHMiLCJjaGVja1ByZWNvbmRpdGlvbnMiLCJidWlsZE1vYmlsZVRhcmdldCIsInJlbW92ZU1vYmlsZVBsYXRmb3JtIiwiaW5qZWN0SXNEZXNrdG9wIiwiY2hhbmdlRGRwVXJsIiwicGFja1RvQXNhciIsInVwZGF0ZURkcFVybCIsImNyZWF0ZVBhY2thZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0lBRVFBLEksa0JBQUFBLEk7O0FBQ1IsSUFBTUMsTUFBTSx3QkFBY0MsTUFBMUI7O0FBRUE7O0FBRUE7Ozs7OztJQUtxQkMsUzs7QUFFakI7Ozs7QUFJQSx1QkFBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsYUFBS0MsR0FBTCxHQUFXLGtCQUFRLFdBQVIsQ0FBWDtBQUNBLGFBQUtELENBQUwsR0FBU0EsQ0FBVDtBQUNBLGFBQUtFLGFBQUwsR0FBcUIsNEJBQWtCRixDQUFsQixDQUFyQjtBQUNBLGFBQUtHLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxhQUFL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Q0EsbUJBQU8sc0JBQVksVUFBQ2IsT0FBRCxFQUFVQyxNQUFWO0FBQUEsdUJBQ2YsZUFBS3lHLGFBQUwsQ0FDSSxPQUFLekssQ0FBTCxDQUFPNkIsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2Qk4sU0FEakMsRUFFSSxlQUFLbkMsSUFBTCxDQUFVLE9BQUtJLENBQUwsQ0FBTzZCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkI2QixJQUF2QyxFQUE2QyxhQUE3QyxDQUZKLEVBR0ksWUFBTTtBQUNGO0FBQ0E7QUFDQSxnREFBYSxZQUFNO0FBQ2YsK0JBQUtqRSxHQUFMLENBQVNpQixPQUFULENBQWlCLG1DQUFqQjtBQUNBLCtCQUFLbEIsQ0FBTCxDQUFPc0UsS0FBUCxDQUNLcUUsYUFETCxDQUNtQixLQURuQixFQUMwQixPQUFLM0ksQ0FBTCxDQUFPNkIsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2Qk4sU0FEdkQsRUFFS21GLElBRkwsQ0FFVSxZQUFNO0FBQ1JuRDtBQUNILHlCQUpMLEVBS0tvRCxLQUxMLENBS1csVUFBQ1ksQ0FBRCxFQUFPO0FBQ1YvRCxtQ0FBTytELENBQVA7QUFDSCx5QkFQTDtBQVFILHFCQVZEO0FBV0gsaUJBakJMLENBRGU7QUFBQSxhQUFaLENBQVA7QUFxQkg7Ozs7O2tCQXgwQmdCaEksUyIsImZpbGUiOiJtZXRlb3JBcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHNwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNpbmdsZUxpbmVMb2cgZnJvbSAnc2luZ2xlLWxpbmUtbG9nJztcbmltcG9ydCBhc2FyIGZyb20gJ2FzYXInO1xuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuXG5pbXBvcnQgSXNEZXNrdG9wSW5qZWN0b3IgZnJvbSAnLi4vc2tlbGV0b24vbW9kdWxlcy9hdXRvdXBkYXRlL2lzRGVza3RvcEluamVjdG9yJztcbmltcG9ydCBMb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IE1ldGVvck1hbmFnZXIgZnJvbSAnLi9tZXRlb3JNYW5hZ2VyJztcblxuY29uc3QgeyBqb2luIH0gPSBwYXRoO1xuY29uc3Qgc2xsID0gc2luZ2xlTGluZUxvZy5zdGRvdXQ7XG5cbi8vIFRPRE86IHJlZmFjdG9yIGFsbCBzdHJhdGVneSBpZnMgdG8gb25lIHBsYWNlXG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgTWV0ZW9yIGFwcC5cbiAqIEBwcm9wZXJ0eSB7TWV0ZW9yRGVza3RvcH0gJFxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ldGVvckFwcCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgLSBjb250ZXh0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ21ldGVvckFwcCcpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgICAgICB0aGlzLm1ldGVvck1hbmFnZXIgPSBuZXcgTWV0ZW9yTWFuYWdlcigkKTtcbiAgICAgICAgdGhpcy5tb2JpbGVQbGF0Zm9ybSA9IG51bGw7XG4gICAgICAgIHRoaXMub2xkTWFuaWZlc3QgPSBudWxsO1xuICAgICAgICB0aGlzLmluamVjdG9yID0gbmV3IElzRGVza3RvcEluamVjdG9yKCk7XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAnX19tZXRlb3JfcnVudGltZV9jb25maWdfXyA9IEpTT04ucGFyc2VcXFxcKGRlY29kZVVSSUNvbXBvbmVudFxcXFwoXCIoW15cIl0qKVwiXFxcXClcXFxcKSdcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZXBsYWNlciA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAnKF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18gPSBKU09OLnBhcnNlXFxcXChkZWNvZGVVUklDb21wb25lbnRcXFxcKClcIihbXlwiXSopXCIoXFxcXClcXFxcKSknXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubWV0ZW9yVmVyc2lvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcyA9IHtcbiAgICAgICAgICAgIElOREVYX0ZST01fQ09SRE9WQV9CVUlMRDogMSxcbiAgICAgICAgICAgIElOREVYX0ZST01fUlVOTklOR19TRVJWRVI6IDJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmVzIHRoYXQgcmVxdWlyZWQgcGFja2FnZXMgYXJlIGFkZGVkIHRvIHRoZSBNZXRlb3IgYXBwLlxuICAgICAqL1xuICAgIGFzeW5jIGVuc3VyZURlc2t0b3BIQ1BQYWNrYWdlcygpIHtcbiAgICAgICAgY29uc3QgZGVza3RvcEhDUFBhY2thZ2VzID0gWydvbWVnYTptZXRlb3ItZGVza3RvcC13YXRjaGVyJywgJ29tZWdhOm1ldGVvci1kZXNrdG9wLWJ1bmRsZXInXTtcbiAgICAgICAgaWYgKHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCkuZGVza3RvcEhDUCkge1xuICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnZGVza3RvcEhDUCBpcyBlbmFibGVkLCBjaGVja2luZyBmb3IgcmVxdWlyZWQgcGFja2FnZXMnKTtcblxuICAgICAgICAgICAgY29uc3QgcGFja2FnZXNXaXRoVmVyc2lvbiA9IGRlc2t0b3BIQ1BQYWNrYWdlcy5tYXAocGFja2FnZU5hbWUgPT4gYCR7cGFja2FnZU5hbWV9QCR7dGhpcy4kLmdldFZlcnNpb24oKX1gKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ldGVvck1hbmFnZXIuZW5zdXJlUGFja2FnZXMoZGVza3RvcEhDUFBhY2thZ2VzLCBwYWNrYWdlc1dpdGhWZXJzaW9uLCAnZGVza3RvcEhDUCcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2Rlc2t0b3BIQ1AgaXMgbm90IGVuYWJsZWQsIHJlbW92aW5nIHJlcXVpcmVkIHBhY2thZ2VzJyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWV0ZW9yTWFuYWdlci5jaGVja1BhY2thZ2VzKGRlc2t0b3BIQ1BQYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tZXRlb3JNYW5hZ2VyLmRlbGV0ZVBhY2thZ2VzKGRlc2t0b3BIQ1BQYWNrYWdlcywgJ2Rlc2t0b3BIQ1AnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBlbnRyeSB0byAubWV0ZW9yLy5naXRpZ25vcmUgaWYgbmVjZXNzYXJ5LlxuICAgICAqL1xuICAgIHVwZGF0ZUdpdElnbm9yZSgpIHtcbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgndXBkYXRpbmcgLm1ldGVvci8uZ2l0aWdub3JlJyk7XG4gICAgICAgIC8vIExldHMgcmVhZCB0aGUgLm1ldGVvci8uZ2l0aWdub3JlIGFuZCBmaWx0ZXIgb3V0IGJsYW5rIGxpbmVzLlxuICAgICAgICBjb25zdCBnaXRJZ25vcmUgPSBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuZ2l0SWdub3JlLCAnVVRGLTgnKVxuICAgICAgICAgICAgLnNwbGl0KCdcXG4nKS5maWx0ZXIoaWdub3JlZFBhdGggPT4gaWdub3JlZFBhdGgudHJpbSgpICE9PSAnJyk7XG5cbiAgICAgICAgaWYgKCF+Z2l0SWdub3JlLmluZGV4T2YodGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGFkZGluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdE5hbWV9IHRvIC5tZXRlb3IvLmdpdGlnbm9yZWApO1xuICAgICAgICAgICAgZ2l0SWdub3JlLnB1c2godGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290TmFtZSk7XG5cbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuZ2l0SWdub3JlLCBnaXRJZ25vcmUuam9pbignXFxuJyksICdVVEYtOCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIE1ldGVvciByZWxlYXNlIHZlcnNpb24gdXNlZCBpbiB0aGUgYXBwLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TWV0ZW9yUmVsZWFzZSgpIHtcbiAgICAgICAgbGV0IHJlbGVhc2UgPSBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucmVsZWFzZSwgJ1VURi04Jykuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgICByZWxlYXNlID0gcmVsZWFzZS5zcGxpdCgnQCcpWzFdO1xuICAgICAgICAvLyBXZSBkbyBub3QgY2FyZSBpZiBpdCBpcyBiZXRhLlxuICAgICAgICBpZiAofnJlbGVhc2UuaW5kZXhPZignLScpKSB7XG4gICAgICAgICAgICByZWxlYXNlID0gcmVsZWFzZS5zcGxpdCgnLScpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWxlYXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhc3QgTWV0ZW9yIHJlbGVhc2UgdG8gc2VtdmVyIHZlcnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBjYXN0TWV0ZW9yUmVsZWFzZVRvU2VtdmVyKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRNZXRlb3JSZWxlYXNlKCl9LjAuMGAubWF0Y2goLyheXFxkK1xcLlxcZCtcXC5cXGQrKS9nbWkpWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIG1ldGVvciB2ZXJzaW9uIGFnYWluc3QgYSB2ZXJzaW9uUmFuZ2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25SYW5nZSAtIHNlbXZlciB2ZXJzaW9uIHJhbmdlXG4gICAgICovXG4gICAgY2hlY2tNZXRlb3JWZXJzaW9uKHZlcnNpb25SYW5nZSkge1xuICAgICAgICBjb25zdCByZWxlYXNlID0gdGhpcy5jYXN0TWV0ZW9yUmVsZWFzZVRvU2VtdmVyKCk7XG4gICAgICAgIGlmICghc2VtdmVyLnNhdGlzZmllcyhyZWxlYXNlLCB2ZXJzaW9uUmFuZ2UpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLnNraXBNb2JpbGVCdWlsZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGB3cm9uZyBtZXRlb3IgdmVyc2lvbiAoJHtyZWxlYXNlfSkgaW4gcHJvamVjdCAtIG9ubHkgYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3ZlcnNpb25SYW5nZX0gaXMgc3VwcG9ydGVkYFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGB3cm9uZyBtZXRlb3IgdmVyc2lvbiAoJHtyZWxlYXNlfSkgaW4gcHJvamVjdCAtIG9ubHkgYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3ZlcnNpb25SYW5nZX0gaXMgc3VwcG9ydGVkIGZvciBhdXRvbWF0aWMgbWV0ZW9yIGJ1aWxkcyAoeW91IGNhbiBhbHdheXMgYCArXG4gICAgICAgICAgICAgICAgICAgICd0cnkgd2l0aCBgLS1za2lwLW1vYmlsZS1idWlsZGAgaWYgeW91IGFyZSB1c2luZyBtZXRlb3IgPj0gMS4yLjEnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY2lkZXMgd2hpY2ggc3RyYXRlZ3kgdG8gdXNlIHdoaWxlIHRyeWluZyB0byBnZXQgY2xpZW50IGJ1aWxkIG91dCBvZiBNZXRlb3IgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIGNob29zZVN0cmF0ZWd5KCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLmZvcmNlQ29yZG92YUJ1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlbGVhc2UgPSB0aGlzLmNhc3RNZXRlb3JSZWxlYXNlVG9TZW12ZXIoKTtcbiAgICAgICAgaWYgKHNlbXZlci5zYXRpc2ZpZXMocmVsZWFzZSwgJz4gMS4zLjQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX1JVTk5JTkdfU0VSVkVSO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZW12ZXIuc2F0aXNmaWVzKHJlbGVhc2UsICcxLjMuNCcpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBsb2RlZFZlcnNpb24gPSB0aGlzLmdldE1ldGVvclJlbGVhc2UoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKGV4cGxvZGVkVmVyc2lvbi5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgIGlmIChleHBsb2RlZFZlcnNpb25bM10gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9SVU5OSU5HX1NFUlZFUjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHJlcXVpcmVkIHByZWNvbmRpdGlvbnMuXG4gICAgICogLSBNZXRlb3IgdmVyc2lvblxuICAgICAqIC0gaXMgbW9iaWxlIHBsYXRmb3JtIGFkZGVkXG4gICAgICovXG4gICAgYXN5bmMgY2hlY2tQcmVjb25kaXRpb25zKCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLnNraXBNb2JpbGVCdWlsZCkge1xuICAgICAgICAgICAgdGhpcy5jaGVja01ldGVvclZlcnNpb24oJz49IDEuMi4xJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrTWV0ZW9yVmVyc2lvbignPj0gMS4zLjMnKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPSB0aGlzLmNob29zZVN0cmF0ZWd5KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSA9PT0gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICAnbWV0ZW9yIHZlcnNpb24gaXMgPCAxLjMuNC4yIHNvIHRoZSBpbmRleC5odG1sIGZyb20gY29yZG92YS1idWlsZCB3aWxsJyArXG4gICAgICAgICAgICAgICAgICAgICcgYmUgdXNlZCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgJ21ldGVvciB2ZXJzaW9uIGlzID49IDEuMy40LjIgc28gdGhlIGluZGV4Lmh0bWwgd2lsbCBiZSBkb3dubG9hZGVkICcgK1xuICAgICAgICAgICAgICAgICAgICAnZnJvbSBfX2NvcmRvdmEvaW5kZXguaHRtbCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLiQuZW52Lm9wdGlvbnMuc2tpcE1vYmlsZUJ1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybXMgPSBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucGxhdGZvcm1zLCAnVVRGLTgnKTtcbiAgICAgICAgICAgIGlmICghfnBsYXRmb3Jtcy5pbmRleE9mKCdhbmRyb2lkJykgJiYgIX5wbGF0Zm9ybXMuaW5kZXhPZignaW9zJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuJC5lbnYub3B0aW9ucy5hbmRyb2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9iaWxlUGxhdGZvcm0gPSAnaW9zJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vYmlsZVBsYXRmb3JtID0gJ2FuZHJvaWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvZy53YXJuKGBubyBtb2JpbGUgdGFyZ2V0IGRldGVjdGVkIC0gd2lsbCBhZGQgJyR7dGhpcy5tb2JpbGVQbGF0Zm9ybX0nIGAgK1xuICAgICAgICAgICAgICAgICAgICAnanVzdCB0byBnZXQgYSBtb2JpbGUgYnVpbGQnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZE1vYmlsZVBsYXRmb3JtKHRoaXMubW9iaWxlUGxhdGZvcm0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2ZhaWxlZCB0byBhZGQgYSBtb2JpbGUgcGxhdGZvcm0gLSBwbGVhc2UgdHJ5IHRvIGRvIGl0IG1hbnVhbGx5Jyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byBhZGQgYSBtb2JpbGUgcGxhdGZvcm0gdG8gbWV0ZW9yIHByb2plY3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYXRmb3JtIC0gcGxhdGZvcm0gdG8gYWRkXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYWRkTW9iaWxlUGxhdGZvcm0ocGxhdGZvcm0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGFkZGluZyBtb2JpbGUgcGxhdGZvcm06ICR7cGxhdGZvcm19YCk7XG4gICAgICAgICAgICBzcGF3bignbWV0ZW9yJywgWydhZGQtcGxhdGZvcm0nLCBwbGF0Zm9ybV0sIHtcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgc3RkaW86IHRoaXMuJC5lbnYuc3RkaW9cbiAgICAgICAgICAgIH0pLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtcyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5wbGF0Zm9ybXMsICdVVEYtOCcpO1xuICAgICAgICAgICAgICAgIGlmICghfnBsYXRmb3Jtcy5pbmRleE9mKCdhbmRyb2lkJykgJiYgIX5wbGF0Zm9ybXMuaW5kZXhPZignaW9zJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byByZW1vdmUgYSBtb2JpbGUgcGxhdGZvcm0gZnJvbSBtZXRlb3IgcHJvamVjdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGxhdGZvcm0gLSBwbGF0Zm9ybSB0byByZW1vdmVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICByZW1vdmVNb2JpbGVQbGF0Zm9ybShwbGF0Zm9ybSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZShgcmVtb3ZpbmcgbW9iaWxlIHBsYXRmb3JtOiAke3BsYXRmb3JtfWApO1xuICAgICAgICAgICAgc3Bhd24oJ21ldGVvcicsIFsncmVtb3ZlLXBsYXRmb3JtJywgcGxhdGZvcm1dLCB7XG4gICAgICAgICAgICAgICAgY3dkOiB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5yb290LFxuICAgICAgICAgICAgICAgIHN0ZGlvOiB0aGlzLiQuZW52LnN0ZGlvLFxuICAgICAgICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbih7IE1FVEVPUl9QUkVUVFlfT1VUUFVUOiAwIH0sIHByb2Nlc3MuZW52KVxuICAgICAgICAgICAgfSkub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGxhdGZvcm1zID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnBsYXRmb3JtcywgJ1VURi04Jyk7XG4gICAgICAgICAgICAgICAgaWYgKH5wbGF0Zm9ybXMuaW5kZXhPZihwbGF0Zm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdXN0IGNoZWNrcyBmb3IgaW5kZXguaHRtbCBhbmQgcHJvZ3JhbS5qc29uIGV4aXN0ZW5jZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0NvcmRvdmFCdWlsZFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSA9PT0gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuY29yZG92YUJ1aWxkSW5kZXgpICYmXG4gICAgICAgICAgICAgICAgdGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbikgJiZcbiAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLm9sZE1hbmlmZXN0IHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLm9sZE1hbmlmZXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZE1hbmlmZXN0ICE9PSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuY29yZG92YUJ1aWxkUHJvZ3JhbUpzb24sICdVVEYtOCcpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLndlYkNvcmRvdmFQcm9ncmFtSnNvbikgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAhdGhpcy5vbGRNYW5pZmVzdCB8fFxuICAgICAgICAgICAgICAgICh0aGlzLm9sZE1hbmlmZXN0ICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2xkTWFuaWZlc3QgIT09IGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLndlYkNvcmRvdmFQcm9ncmFtSnNvbiwgJ1VURi04JylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZldGNoZXMgaW5kZXguaHRtbCBmcm9tIHJ1bm5pbmcgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Kj59XG4gICAgICovXG4gICAgYXN5bmMgYWNxdWlyZUluZGV4KCkge1xuICAgICAgICBjb25zdCBwb3J0ID0gKHRoaXMuJC5lbnYub3B0aW9ucy5wb3J0KSA/IHRoaXMuJC5lbnYub3B0aW9ucy5wb3J0IDogMzA4MDtcbiAgICAgICAgdGhpcy5sb2cuaW5mbygnYWNxdWlyaW5nIGluZGV4Lmh0bWwnKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fS9fX2NvcmRvdmEvaW5kZXguaHRtbGApO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgLy8gU2ltcGxlIHRlc3QgaWYgd2UgcmVhbGx5IGRvd25sb2FkIGluZGV4Lmh0bWwgZm9yIHdlYi5jb3Jkb3ZhLlxuICAgICAgICBpZiAofnRleHQuaW5kZXhPZignc3JjPVwiL2NvcmRvdmEuanNcIicpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyBtYWluZmVzdC5qc29uIGZyb20gcnVubmluZyBwcm9qZWN0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cbiAgICAgKi9cbiAgICBhc3luYyBhY3F1aXJlTWFuaWZlc3QoKSB7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAodGhpcy4kLmVudi5vcHRpb25zLnBvcnQpID8gdGhpcy4kLmVudi5vcHRpb25zLnBvcnQgOiAzMDgwO1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdhY3F1aXJpbmcgbWFuaWZlc3QuanNvbicpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcbiAgICAgICAgICAgIGBodHRwOi8vMTI3LjAuMC4xOiR7cG9ydH0vX19jb3Jkb3ZhL21hbmlmZXN0Lmpzb24/bWV0ZW9yX2RvbnRfc2VydmVfaW5kZXg9dHJ1ZWApO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gZ2V0IGEgbW9iaWxlIGJ1aWxkIGZyb20gbWV0ZW9yIGFwcC5cbiAgICAgKiBJbiBjYXNlIG9mIGZhaWx1cmUgbGVhdmVzIGEgbWV0ZW9yLmxvZy5cbiAgICAgKiBBIGxvdCBvZiBzdHVmZiBpcyBoYXBwZW5pbmcgaGVyZSAtIGJ1dCB0aGUgbWFpbiBhaW0gaXMgdG8gZ2V0IGEgbW9iaWxlIGJ1aWxkIGZyb21cbiAgICAgKiAubWV0ZW9yL2xvY2FsL2NvcmRvdmEtYnVpbGQvd3d3L2FwcGxpY2F0aW9uIGFuZCBleGl0IGFzIHNvb24gYXMgcG9zc2libGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBidWlsZE1vYmlsZVRhcmdldCgpIHtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUpzb24gPVxuICAgICAgICAgICAgKHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPT09IHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQpID9cbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiA6XG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAud2ViQ29yZG92YVByb2dyYW1Kc29uO1xuXG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHByb2dyYW1Kc29uKSkge1xuICAgICAgICAgICAgdGhpcy5vbGRNYW5pZmVzdCA9IGZzLnJlYWRGaWxlU3luYyhwcm9ncmFtSnNvbiwgJ1VURi04Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgbG9nID0gJyc7XG4gICAgICAgICAgICBsZXQgZGVzaXJlZEV4aXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBidWlsZFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGVycm9yVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGtpbGxUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBjb3Jkb3ZhQ2hlY2tJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcG9ydFByb2JsZW0gPSBmYWxzZTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gd2luZG93c0tpbGwocGlkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2cuZGVidWcoYGtpbGxpbmcgcGlkOiAke3BpZH1gKTtcbiAgICAgICAgICAgICAgICBzcGF3bi5zeW5jKCd0YXNra2lsbCcsIFsnL3BpZCcsIHBpZCwgJy9mJywgJy90J10pO1xuXG4gICAgICAgICAgICAgICAgLy8gV2Ugd2lsbCBsb29rIGZvciBvdGhlciBwcm9jZXNzIHdoaWNoIG1pZ2h0IGhhdmUgYmVlbiBjcmVhdGVkIG91dHNpZGUgdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJvY2VzcyB0cmVlLlxuICAgICAgICAgICAgICAgIC8vIExldHMgbGlzdCBhbGwgbm9kZS5leGUgcHJvY2Vzc2VzLlxuICAgICAgICAgICAgICAgIGNvbnN0IG91dCA9IHNwYXduXG4gICAgICAgICAgICAgICAgICAgIC5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dtaWMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydwcm9jZXNzJywgJ3doZXJlJywgJ2NhcHRpb249XCJub2RlLmV4ZVwiJywgJ2dldCcsICdjb21tYW5kbGluZSxwcm9jZXNzaWQnXSlcbiAgICAgICAgICAgICAgICAgICAgLnN0ZG91dC50b1N0cmluZygndXRmLTgnKVxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZWxmLnByZXBhcmVBcmd1bWVudHMoKTtcbiAgICAgICAgICAgICAgICAvLyBMZXRzIG1vdW50IHJlZ2V4LlxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4VjEgPSBuZXcgUmVnRXhwKGAke2FyZ3Muam9pbignXFxcXHMrJyl9XFxcXHMrKFxcXFxkKylgLCAnZ20nKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleFYyID0gbmV3IFJlZ0V4cChgXCIke2FyZ3Muam9pbignXCJcXFxccytcIicpfVwiXFxcXHMrKFxcXFxkKylgLCAnZ20nKTtcbiAgICAgICAgICAgICAgICAvLyBObyB3ZSB3aWxsIGNoZWNrIGZvciB0aG9zZSB3aXRoIHRoZSBtYXRjaGluZyBwYXJhbXMuXG4gICAgICAgICAgICAgICAgb3V0LmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSByZWdleFYxLmV4ZWMobGluZSkgfHwgcmVnZXhWMi5leGVjKGxpbmUpIHx8IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubG9nLmRlYnVnKGBraWxsaW5nIHBpZDogJHttYXRjaFsxXX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduLnN5bmMoJ3Rhc2traWxsJywgWycvcGlkJywgbWF0Y2hbMV0sICcvZicsICcvdCddKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB3cml0ZUxvZygpIHtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCdtZXRlb3IubG9nJywgbG9nLCAnVVRGLTgnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2xlYXJUaW1lb3V0c0FuZEludGVydmFscygpIHtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNvcmRvdmFDaGVja0ludGVydmFsKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYnVpbGRUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZXJyb3JUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQobWVzc2FnZVRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChraWxsVGltZW91dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnByZXBhcmVBcmd1bWVudHMoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2cuaW5mbyhgcnVubmluZyBcIm1ldGVvciAke2FyZ3Muam9pbignICcpfVwiLi4uIHRoaXMgbWlnaHQgdGFrZSBhIHdoaWxlYCk7XG5cbiAgICAgICAgICAgIC8vIExldHMgc3Bhd24gbWV0ZW9yLlxuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihcbiAgICAgICAgICAgICAgICAnbWV0ZW9yJyxcbiAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZW52OiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBNRVRFT1JfUFJFVFRZX09VVFBVVDogMCwgTUVURU9SX05PX1JFTEVBU0VfQ0hFQ0s6IDEgfSwgcHJvY2Vzcy5lbnYpLFxuICAgICAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHsgc2hlbGw6IHRydWUgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gS2lsbHMgdGhlIGN1cnJlbnRseSBydW5uaW5nIG1ldGVvciBjb21tYW5kLlxuICAgICAgICAgICAgZnVuY3Rpb24ga2lsbCgpIHtcbiAgICAgICAgICAgICAgICBzbGwoJycpO1xuICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi4kLmVudi5vcy5pc1dpbmRvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93c0tpbGwoY2hpbGQucGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV4aXQoKSB7XG4gICAgICAgICAgICAgICAga2lsbFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0c0FuZEludGVydmFscygpO1xuICAgICAgICAgICAgICAgICAgICBkZXNpcmVkRXhpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGtpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNvcHlCdWlsZCgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNvcHlCdWlsZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBleGl0KCk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXRzQW5kSW50ZXJ2YWxzKCk7XG4gICAgICAgICAgICAgICAgICAgIGtpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVMb2coKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdjb3B5Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvcmRvdmFDaGVja0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBjb3Jkb3ZhLWJ1aWxkIHJlYWR5LlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQ29yZG92YUJ1aWxkUmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBzbywgdGhlbiBleGl0IGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlCdWlsZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBjaHVuay50b1N0cmluZygnVVRGLTgnKTtcbiAgICAgICAgICAgICAgICBsb2cgKz0gYCR7bGluZX1cXG5gO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvclRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGVycm9yVGltZW91dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBleGl0IGlmIHRoaXMgaXMgdGhlIHdhcm5pbmcgZm9yIHVzaW5nIC0tcHJvZHVjdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBPdXRwdXQgZXhjZWVkcyAtPiBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvODU5MlxuICAgICAgICAgICAgICAgIGlmICghfmxpbmUuaW5kZXhPZignLS1wcm9kdWN0aW9uJykgJiYgIX5saW5lLmluZGV4T2YoJ091dHB1dCBleGNlZWRzICcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHdpbGwgZXhpdCAxcyBhZnRlciBsYXN0IGVycm9yIGluIHN0ZGVyci5cbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXRzQW5kSW50ZXJ2YWxzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBraWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUxvZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdlcnJvcicpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGNodW5rLnRvU3RyaW5nKCdVVEYtOCcpO1xuICAgICAgICAgICAgICAgIGlmICghZGVzaXJlZEV4aXQgJiYgbGluZS50cmltKCkucmVwbGFjZSgvW1xcblxcclxcdFxcdlxcZl0rL2dtLCAnJykgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzVG9EaXNwbGF5ID0gbGluZS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnXFxuXFxyJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgZGlzcGxheSBsYXN0IGxpbmUgZnJvbSB0aGUgY2h1bmsuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhbml0aXplZExpbmUgPSBsaW5lc1RvRGlzcGxheS5wb3AoKS5yZXBsYWNlKC9bXFxuXFxyXFx0XFx2XFxmXSsvZ20sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgc2xsKHNhbml0aXplZExpbmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2cgKz0gYCR7bGluZX1cXG5gO1xuICAgICAgICAgICAgICAgIGlmICh+bGluZS5pbmRleE9mKCdhZnRlcl9wbGF0Zm9ybV9hZGQnKSkge1xuICAgICAgICAgICAgICAgICAgICBzbGwoJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCdkb25lLi4uIDEwJScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh+bGluZS5pbmRleE9mKCdMb2NhbCBwYWNrYWdlIHZlcnNpb24nKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChtZXNzYWdlVGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsbCgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCdidWlsZGluZyBpbiBwcm9ncmVzcy4uLicpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxNTAwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAofmxpbmUuaW5kZXhPZignUHJlcGFyaW5nIENvcmRvdmEgcHJvamVjdCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsbCgnJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2RvbmUuLi4gNjAlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKH5saW5lLmluZGV4T2YoJ0NhblxcJ3QgbGlzdGVuIG9uIHBvcnQnKSkge1xuICAgICAgICAgICAgICAgICAgICBwb3J0UHJvYmxlbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKH5saW5lLmluZGV4T2YoJ1lvdXIgYXBwbGljYXRpb24gaGFzIGVycm9ycycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvclRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChlcnJvclRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0c0FuZEludGVydmFscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAga2lsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGVMb2coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnZXJyb3JJbkFwcCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAofmxpbmUuaW5kZXhPZignQXBwIHJ1bm5pbmcgYXQnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5QnVpbGQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gV2hlbiBNZXRlb3IgZXhpdHNcbiAgICAgICAgICAgIGNoaWxkLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNsbCgnJyk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0c0FuZEludGVydmFscygpO1xuICAgICAgICAgICAgICAgIGlmICghZGVzaXJlZEV4aXQpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVMb2coKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvcnRQcm9ibGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ3BvcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnZXhpdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJ1aWxkVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGtpbGwoKTtcbiAgICAgICAgICAgICAgICB3cml0ZUxvZygpO1xuICAgICAgICAgICAgICAgIHJlamVjdCgndGltZW91dCcpO1xuICAgICAgICAgICAgfSwgdGhpcy4kLmVudi5vcHRpb25zLmJ1aWxkVGltZW91dCA/IHRoaXMuJC5lbnYub3B0aW9ucy5idWlsZFRpbWVvdXQgKiAxMDAwIDogNjAwMDAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwbGFjZXMgdGhlIEREUCB1cmwgdGhhdCB3YXMgdXNlZCBvcmlnaW5hbGx5IHdoZW4gTWV0ZW9yIHdhcyBidWlsZGluZyB0aGUgY2xpZW50LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbmRleEh0bWwgLSBwYXRoIHRvIGluZGV4Lmh0bWwgZnJvbSB0aGUgY2xpZW50XG4gICAgICovXG4gICAgdXBkYXRlRGRwVXJsKGluZGV4SHRtbCkge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgbGV0IHJ1bnRpbWVDb25maWc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaW5kZXhIdG1sLCAnVVRGLTgnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYGVycm9yIGxvYWRpbmcgaW5kZXguaHRtbCBmaWxlOiAke2UubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubWF0Y2hlci50ZXN0KGNvbnRlbnQpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignY291bGQgbm90IGZpbmQgcnVudGltZSBjb25maWcgaW4gaW5kZXggZmlsZScpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBjb250ZW50Lm1hdGNoKHRoaXMubWF0Y2hlcik7XG4gICAgICAgICAgICBydW50aW1lQ29uZmlnID0gSlNPTi5wYXJzZShkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignY291bGQgbm90IGZpbmQgcnVudGltZSBjb25maWcgaW4gaW5kZXggZmlsZScpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5kZHBVcmwuc3Vic3RyKC0xLCAxKSAhPT0gJy8nKSB7XG4gICAgICAgICAgICB0aGlzLiQuZW52Lm9wdGlvbnMuZGRwVXJsICs9ICcvJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bnRpbWVDb25maWcuUk9PVF9VUkwgPSB0aGlzLiQuZW52Lm9wdGlvbnMuZGRwVXJsO1xuICAgICAgICBydW50aW1lQ29uZmlnLkREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMID0gdGhpcy4kLmVudi5vcHRpb25zLmRkcFVybDtcblxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgICAgICAgdGhpcy5yZXBsYWNlciwgYCQxXCIke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShydW50aW1lQ29uZmlnKSl9XCIkM2ApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGluZGV4SHRtbCwgY29udGVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBlcnJvciB3cml0aW5nIGluZGV4Lmh0bWwgZmlsZTogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2cuaW5mbygnc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgZGRwIHN0cmluZyBpbiB0aGUgcnVudGltZSBjb25maWcgb2YgYSBtb2JpbGUgYnVpbGQnICtcbiAgICAgICAgICAgIGAgdG8gJHt0aGlzLiQuZW52Lm9wdGlvbnMuZGRwVXJsfWApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZXBhcmVzIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIGBtZXRlb3JgIGNvbW1hbmQuXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgICAqL1xuICAgIHByZXBhcmVBcmd1bWVudHMoKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbJ3J1bicsICctLXZlcmJvc2UnLCBgLS1tb2JpbGUtc2VydmVyPSR7dGhpcy4kLmVudi5vcHRpb25zLmRkcFVybH1gXTtcbiAgICAgICAgaWYgKHRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKCctLXByb2R1Y3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgICBhcmdzLnB1c2goJy1wJyk7XG4gICAgICAgIGlmICh0aGlzLiQuZW52Lm9wdGlvbnMucG9ydCkge1xuICAgICAgICAgICAgYXJncy5wdXNoKHRoaXMuJC5lbnYub3B0aW9ucy5wb3J0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCgnMzA4MCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLiQuZW52Lm9wdGlvbnMubWV0ZW9yU2V0dGluZ3MpIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCgnLS1zZXR0aW5ncycsIHRoaXMuJC5lbnYub3B0aW9ucy5tZXRlb3JTZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIHRoZSBtb2JpbGUgYnVpbGQgYW5kIGNvcGllcyBpdCBpbnRvIGVsZWN0cm9uIGFwcC5cbiAgICAgKi9cbiAgICBhc3luYyBjb3B5QnVpbGQoKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCdjbGVhcmluZyBidWlsZCBkaXInKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuJC51dGlscy5ybVdpdGhSZXRyaWVzKCctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmVmaXggPSAnY29yZG92YUJ1aWxkJztcbiAgICAgICAgbGV0IGNvcHlQYXRoUG9zdGZpeCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLmluZGV4SFRNTHN0cmF0ZWd5ID09PSB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9SVU5OSU5HX1NFUlZFUikge1xuICAgICAgICAgICAgcHJlZml4ID0gJ3dlYkNvcmRvdmEnO1xuICAgICAgICAgICAgY29weVBhdGhQb3N0Zml4ID0gYCR7cGF0aC5zZXB9KmA7XG4gICAgICAgICAgICBsZXQgaW5kZXhIdG1sO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5ta2Rpcih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCk7XG4gICAgICAgICAgICAgICAgaW5kZXhIdG1sID0gYXdhaXQgdGhpcy5hY3F1aXJlSW5kZXgoKTtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwSW5kZXgsIGluZGV4SHRtbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnc3VjY2Vzc2Z1bGx5IGRvd25sb2FkZWQgaW5kZXguaHRtbCBmcm9tIHJ1bm5pbmcgbWV0ZW9yIGFwcCcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSB0cnlpbmcgdG8gZG93bmxvYWQgaW5kZXguaHRtbCBmb3Igd2ViLmNvcmRvdmEsICcgK1xuICAgICAgICAgICAgICAgICAgICAnYmUgc3VyZSB0aGF0IHlvdSBhcmUgcnVubmluZyBhIG1vYmlsZSB0YXJnZXQgb3Igd2l0aCcgK1xuICAgICAgICAgICAgICAgICAgICAnIC0tbW9iaWxlLXNlcnZlcjogJywgZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvcmRvdmFCdWlsZCA9IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwW3ByZWZpeF07XG4gICAgICAgIGNvbnN0IGNvcmRvdmFCdWlsZEluZGV4ID0gdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuY29yZG92YUJ1aWxkSW5kZXg7XG4gICAgICAgIGNvbnN0IGNvcmRvdmFCdWlsZFByb2dyYW1Kc29uID0gdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHBbYCR7cHJlZml4fVByb2dyYW1Kc29uYF07XG5cbiAgICAgICAgaWYgKCF0aGlzLiQudXRpbHMuZXhpc3RzKGNvcmRvdmFCdWlsZCkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBubyBtb2JpbGUgYnVpbGQgZm91bmQgYXQgJHtjb3Jkb3ZhQnVpbGR9YCk7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignYXJlIHlvdSBzdXJlIHlvdSBkaWQgcnVuIG1ldGVvciB3aXRoIC0tbW9iaWxlLXNlcnZlcj8nKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncmVxdWlyZWQgZmlsZSBub3QgcHJlc2VudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLiQudXRpbHMuZXhpc3RzKGNvcmRvdmFCdWlsZFByb2dyYW1Kc29uKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ25vIHByb2dyYW0uanNvbiBmb3VuZCBpbiBtb2JpbGUgYnVpbGQgZm91bmQgYXQgJyArXG4gICAgICAgICAgICAgICAgYCR7Y29yZG92YUJ1aWxkfWApO1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2FyZSB5b3Ugc3VyZSB5b3UgZGlkIHJ1biBtZXRlb3Igd2l0aCAtLW1vYmlsZS1zZXJ2ZXI/Jyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcXVpcmVkIGZpbGUgbm90IHByZXNlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmluZGV4SFRNTHN0cmF0ZWd5ICE9PSB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9SVU5OSU5HX1NFUlZFUikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLiQudXRpbHMuZXhpc3RzKGNvcmRvdmFCdWlsZEluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdubyBpbmRleC5odG1sIGZvdW5kIGluIGNvcmRvdmEgYnVpbGQgZm91bmQgYXQgJyArXG4gICAgICAgICAgICAgICAgICAgIGAke2NvcmRvdmFCdWlsZH1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignYXJlIHlvdSBzdXJlIHlvdSBkaWQgcnVuIG1ldGVvciB3aXRoIC0tbW9iaWxlLXNlcnZlcj8nKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcXVpcmVkIGZpbGUgbm90IHByZXNlbnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2NvcHlpbmcgbW9iaWxlIGJ1aWxkJyk7XG4gICAgICAgIHNoZWxsLmNwKFxuICAgICAgICAgICAgJy1SJywgYCR7Y29yZG92YUJ1aWxkfSR7Y29weVBhdGhQb3N0Zml4fWAsIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gQmVjYXVzZSBvZiB2YXJpb3VzIHBlcm1pc3Npb24gcHJvYmxlbXMgaGVyZSB3ZSB0cnkgdG8gY2xlYXIgdGUgcGF0aCBieSBjbGVhcmluZ1xuICAgICAgICAvLyBhbGwgcG9zc2libGUgcmVzdHJpY3Rpb25zLlxuICAgICAgICBzaGVsbC5jaG1vZChcbiAgICAgICAgICAgICctUicsICc3NzcnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcFxuICAgICAgICApO1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcy5pc1dpbmRvd3MpIHtcbiAgICAgICAgICAgIHNoZWxsLmV4ZWMoYGF0dHJpYiAtciAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwfSR7cGF0aC5zZXB9Ki4qIC9zYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSA9PT0gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fUlVOTklOR19TRVJWRVIpIHtcbiAgICAgICAgICAgIGxldCBwcm9ncmFtSnNvbjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcHJvZ3JhbUpzb24gPSBhd2FpdCB0aGlzLmFjcXVpcmVNYW5pZmVzdCgpO1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwUHJvZ3JhbUpzb24sXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHByb2dyYW1Kc29uLCBudWxsLCA0KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnc3VjY2Vzc2Z1bGx5IGRvd25sb2FkZWQgbWFuaWZlc3QuanNvbiBmcm9tIHJ1bm5pbmcgbWV0ZW9yIGFwcCcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSB0cnlpbmcgdG8gZG93bmxvYWQgbWFuaWZlc3QuanNvbiBmb3Igd2ViLmNvcmRvdmEsJyArXG4gICAgICAgICAgICAgICAgICAgICcgYmUgc3VyZSB0aGF0IHlvdSBhcmUgcnVubmluZyBhIG1vYmlsZSB0YXJnZXQgb3Igd2l0aCcgK1xuICAgICAgICAgICAgICAgICAgICAnIC0tbW9iaWxlLXNlcnZlcjogJywgZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nLmluZm8oJ21vYmlsZSBidWlsZCBjb3BpZWQgdG8gZWxlY3Ryb24gYXBwJyk7XG5cbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ2NvcHkgY29yZG92YS5qcyB0byBtZXRlb3IgYnVpbGQnKTtcbiAgICAgICAgc2hlbGwuY3AoXG4gICAgICAgICAgICBqb2luKF9fZGlybmFtZSwgJy4uJywgJ3NrZWxldG9uJywgJ2NvcmRvdmEuanMnKSxcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5qZWN0cyBNZXRlb3IuaXNEZXNrdG9wXG4gICAgICovXG4gICAgaW5qZWN0SXNEZXNrdG9wKCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdpbmplY3RpbmcgaXNEZXNrdG9wJyk7XG5cbiAgICAgICAgbGV0IG1hbmlmZXN0SnNvblBhdGggPSB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbjtcbiAgICAgICAgaWYgKHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPT09IHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX1JVTk5JTkdfU0VSVkVSKSB7XG4gICAgICAgICAgICBtYW5pZmVzdEpzb25QYXRoID0gdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAud2ViQ29yZG92YVByb2dyYW1Kc29uO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMobWFuaWZlc3RKc29uUGF0aCwgJ1VURi04JylcbiAgICAgICAgICAgICkubWFuaWZlc3Q7XG4gICAgICAgICAgICBsZXQgaW5qZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBpbmplY3RlZFN0YXJ0dXBEaWRDb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIFdlIHdpbGwgc2VhcmNoIGluIGV2ZXJ5IC5qcyBmaWxlIGluIHRoZSBtYW5pZmVzdC5cbiAgICAgICAgICAgIC8vIFdlIGNvdWxkIHByb2JhYmx5IGRldGVjdCB3aGV0aGVyIHRoaXMgaXMgYSBkZXYgb3IgcHJvZHVjdGlvbiBidWlsZCBhbmQgb25seSBzZWFyY2ggaW5cbiAgICAgICAgICAgIC8vIHRoZSBjb3JyZWN0IGZpbGVzLCBidXQgZm9yIG5vdyB0aGlzIHNob3VsZCBiZSBmaW5lLlxuICAgICAgICAgICAgbWFuaWZlc3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBmaWxlQ29udGVudHM7XG4gICAgICAgICAgICAgICAgLy8gSGFja3kgd2F5IG9mIHNldHRpbmcgaXNEZXNrdG9wLlxuICAgICAgICAgICAgICAgIGlmIChmaWxlLnR5cGUgPT09ICdqcycpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCwgZmlsZS5wYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdVVEYtOCdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5pbmplY3Rvci5wcm9jZXNzRmlsZUNvbnRlbnRzKGZpbGVDb250ZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZUNvbnRlbnRzID0gcmVzdWx0LmZpbGVDb250ZW50cztcbiAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRTdGFydHVwRGlkQ29tcGxldGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlID8gdHJ1ZSA6IGluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlO1xuICAgICAgICAgICAgICAgICAgICBpbmplY3RlZCA9IHJlc3VsdC5pbmplY3RlZCA/IHRydWUgOiBpbmplY3RlZDtcblxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCwgZmlsZS5wYXRoKSwgZmlsZUNvbnRlbnRzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3IgaW5qZWN0aW5nIGlzRGVza3RvcCBnbG9iYWwgdmFyLicpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRTdGFydHVwRGlkQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3IgaW5qZWN0aW5nIGlzRGVza3RvcCBmb3Igc3RhcnR1cERpZENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgaW5qZWN0aW5nIGlzRGVza3RvcDogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2cuaW5mbygnaW5qZWN0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzLCBtb2RpZmllcyBhbmQgY29waWVzIHRoZSBtZXRlb3IgYXBwIHRvIGVsZWN0cm9uIGFwcC5cbiAgICAgKi9cbiAgICBhc3luYyBidWlsZCgpIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mbygnY2hlY2tpbmcgZm9yIGFueSBtb2JpbGUgcGxhdGZvcm0nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCBkdXJpbmcgY2hlY2tpbmcgcHJlY29uZGl0aW9uczogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdidWlsZGluZyBtZXRlb3IgYXBwJyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLiQuZW52Lm9wdGlvbnMuc2tpcE1vYmlsZUJ1aWxkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRNb2JpbGVUYXJnZXQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RpbWVvdXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpbWVvdXQgd2hpbGUgYnVpbGRpbmcsIGxvZyBoYXMgYmVlbiB3cml0dGVuIHRvIG1ldGVvci5sb2cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc29tZSBlcnJvcnMgd2VyZSByZXBvcnRlZCBkdXJpbmcgYnVpbGQsIGNoZWNrIG1ldGVvci5sb2cgZm9yIG1vcmUnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGluZm8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdlcnJvckluQXBwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5b3VyIG1ldGVvciBhcHAgaGFzIGVycm9ycyAtIGxvb2sgaW50byBtZXRlb3IubG9nIGZvciBtb3JlJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBpbmZvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncG9ydCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneW91ciBwb3J0IDMwODAgaXMgY3VycmVudGx5IHVzZWQgKHlvdSBwcm9iYWJseSBoYXZlIHRoaXMgb3Igb3RoZXIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21ldGVvciBwcm9qZWN0IHJ1bm5pbmc/KSwgdXNlIGAtdGAgb3IgYC0tbWV0ZW9yLXBvcnRgIHRvIHVzZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlmZmVyZW50IHBvcnQgd2hpbGUgYnVpbGRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdleGl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtZXRlb3IgY21kIGV4aXRlZCB1bmV4cGVjdGVkbHksIGxvZyBoYXMgYmVlbiB3cml0dGVuIHRvIG1ldGVvci5sb2cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjb3B5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlcnJvciBlbmNvdW50ZXJlZCB3aGVuIGNvcHlpbmcgdGhlIGJ1aWxkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCBkdXJpbmcgYnVpbGRpbmcgbW9iaWxlIHRhcmdldCcsIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vYmlsZVBsYXRmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVtb3ZlTW9iaWxlUGxhdGZvcm0odGhpcy5tb2JpbGVQbGF0Zm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPSB0aGlzLmNob29zZVN0cmF0ZWd5KCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuY29weUJ1aWxkKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmplY3RJc0Rlc2t0b3AoKTtcblxuICAgICAgICB0aGlzLmNoYW5nZURkcFVybCgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBhY2tUb0FzYXIoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHBhY2tpbmcgbWV0ZW9yIGFwcCB0byBhc2FyJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdtZXRlb3IgYnVpbGQgZmluaXNoZWQnKTtcblxuICAgICAgICBpZiAodGhpcy5tb2JpbGVQbGF0Zm9ybSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW1vdmVNb2JpbGVQbGF0Zm9ybSh0aGlzLm1vYmlsZVBsYXRmb3JtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZURkcFVybCgpIHtcbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5kZHBVcmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEZHBVcmwodGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5tZXRlb3JBcHBJbmRleCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYGVycm9yIHdoaWxlIHRyeWluZyB0byBjaGFuZ2UgdGhlIGRkcCB1cmw6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGFja1RvQXNhcigpIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mbygncGFja2luZyBtZXRlb3IgYXBwIHRvIGFzYXIgYXJjaGl2ZScpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICAgIGFzYXIuY3JlYXRlUGFja2FnZShcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCxcbiAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnbWV0ZW9yLmFzYXInKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIFdpbmRvd3Mgc29tZSBmaWxlcyBtaWdodCBzdGlsbCBiZSBibG9ja2VkLiBHaXZpbmcgYSB0aWNrIGZvciB0aGVtIHRvIGJlXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlYWR5IGZvciBkZWxldGlvbi5cbiAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2NsZWFyaW5nIG1ldGVvciBhcHAgYWZ0ZXIgcGFja2luZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLnV0aWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJtV2l0aFJldHJpZXMoJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==