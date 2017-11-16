'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hashFiles = require('hash-files');

var _hashFiles2 = _interopRequireDefault(_hashFiles);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_shelljs2.default.config.fatal = true;

/**
 * Checks if the path is empty.
 * @param {string} searchPath
 * @returns {boolean}
 */
function isEmptySync(searchPath) {
    var stat = void 0;
    try {
        stat = _fs2.default.statSync(searchPath);
    } catch (e) {
        return true;
    }
    if (stat.isDirectory()) {
        var items = _fs2.default.readdirSync(searchPath);
        return !items || !items.length;
    }
    return false;
}

/**
 * Represents the .desktop directory.
 * @class
 * @property {desktopSettings} settings
 */

var Desktop = function () {

    /**
     * @param {MeteorDesktop} $ - context
     *
     * @constructor
     */
    function Desktop($) {
        (0, _classCallCheck3.default)(this, Desktop);

        this.$ = $;
        this.log = new _log2.default('desktop');
        this.settings = null;
    }

    /**
     * Tries to read and returns settings.json contents from .desktop dir.
     *
     * @returns {desktopSettings|null}
     */


    (0, _createClass3.default)(Desktop, [{
        key: 'getSettings',
        value: function getSettings() {
            if (!this.settings) {
                try {
                    this.settings = JSON.parse(_fs2.default.readFileSync(this.$.env.paths.desktop.settings, 'UTF-8'));
                } catch (e) {
                    this.log.error('error while trying to read \'.desktop/settings.json\': ', e);
                    process.exit(1);
                }
            }
            return this.settings;
        }

        /**
         * Returns a version hash representing current .desktop contents.
         * @returns {string}
         */

    }, {
        key: 'getHashVersion',
        value: function getHashVersion() {
            this.log.info('calculating hash version from .desktop contents');
            var version = _hashFiles2.default.sync({
                files: ['' + this.$.env.paths.desktop.root + _path2.default.sep + '**']
            });
            this.log.verbose('calculated .desktop hash version is ' + version);
            return version;
        }

        /**
         * Tries to read a module.json file from a module at provided path.
         *
         * @param {string} modulePath - path to the module dir
         * @returns {Object}
         */

    }, {
        key: 'getModuleConfig',
        value: function getModuleConfig(modulePath) {
            var moduleConfig = {};
            try {
                moduleConfig = JSON.parse(_fs2.default.readFileSync(_path2.default.join(modulePath, 'module.json'), 'UTF-8'));
            } catch (e) {
                this.log.error('error while trying to read \'module.json\' from \'' + modulePath + '\' module: ', e);
                process.exit(1);
            }
            if (!('name' in moduleConfig)) {
                this.log.error('no \'name\' field defined in \'module.json\' in \'' + modulePath + '\' module.');
                process.exit(1);
            }
            return moduleConfig;
        }

        /**
         * Scans all modules for module.json and gathers this configuration altogether.
         *
         * @returns {[]}
         */

    }, {
        key: 'gatherModuleConfigs',
        value: function gatherModuleConfigs() {
            var _this = this;

            var configs = [];

            if (!isEmptySync(this.$.env.paths.desktop.modules)) {
                _shelljs2.default.ls('-d', _path2.default.join(this.$.env.paths.desktop.modules, '*')).forEach(function (module) {
                    if (_fs2.default.lstatSync(module).isDirectory()) {
                        var moduleConfig = _this.getModuleConfig(module);
                        moduleConfig.dirName = _path2.default.parse(module).name;
                        configs.push(moduleConfig);
                    }
                });
            }
            return configs;
        }

        /**
         * Summarizes all dependencies defined in .desktop.
         *
         * @params {Object} settings      - settings.json
         * @params {boolean} checkModules - whether to gather modules dependencies
         * @returns {{fromSettings: {}, plugins: {}, modules: {}}}
         */

    }, {
        key: 'getDependencies',
        value: function getDependencies() {
            var _this2 = this;

            var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var checkModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var dependencies = {
                fromSettings: {},
                plugins: {},
                modules: {}
            };
            /** @type {desktopSettings} **/
            var settingsJson = settings || this.getSettings();

            // Settings can have a 'dependencies' field.
            if ('dependencies' in settingsJson) {
                dependencies.fromSettings = settingsJson.dependencies;
            }

            // Plugins are also a npm packages.
            if ('plugins' in settingsJson) {
                dependencies.plugins = (0, _keys2.default)(settingsJson.plugins).reduce(function (plugins, plugin) {
                    /* eslint-disable no-param-reassign */
                    if ((0, _typeof3.default)(settingsJson.plugins[plugin]) === 'object') {
                        plugins[plugin] = settingsJson.plugins[plugin].version;
                    } else {
                        plugins[plugin] = settingsJson.plugins[plugin];
                    }
                    return plugins;
                }, {});
            }

            // Each module can have its own dependencies defined.
            var moduleDependencies = {};
            if (checkModules) {
                var configs = this.gatherModuleConfigs();

                configs.forEach(function (moduleConfig) {
                    if (!('dependencies' in moduleConfig)) {
                        moduleConfig.dependencies = {};
                    }
                    if (moduleConfig.name in moduleDependencies) {
                        _this2.log.error('duplicate name \'' + moduleConfig.name + '\' in \'module.json\' in ' + ('\'' + moduleConfig.dirName + '\' - another module already registered the same name.'));
                        process.exit(1);
                    }
                    moduleDependencies[moduleConfig.name] = moduleConfig.dependencies;
                });
            }

            dependencies.modules = moduleDependencies;
            return dependencies;
        }

        /**
         * Copies the .desktop scaffold into the meteor app dir.
         * Adds entry to .meteor/.gitignore.
         */

    }, {
        key: 'scaffold',
        value: function scaffold() {
            this.log.info('creating .desktop scaffold in your project');

            if (this.$.utils.exists(this.$.env.paths.desktop.root)) {
                this.log.warn('.desktop already exists - delete it if you want a new one to be ' + 'created');
                return;
            }

            _shelljs2.default.cp('-r', this.$.env.paths.scaffold, this.$.env.paths.desktop.root);
            _shelljs2.default.mkdir(this.$.env.paths.desktop.import);
            this.log.info('.desktop directory prepared');
        }

        /**
         * Verifies if all mandatory files are present in the .desktop.
         *
         * @returns {boolean}
         */

    }, {
        key: 'check',
        value: function check() {
            this.log.verbose('checking .desktop existence');
            return !!(this.$.utils.exists(this.$.env.paths.desktop.root) && this.$.utils.exists(this.$.env.paths.desktop.settings) && this.$.utils.exists(this.$.env.paths.desktop.desktop));
        }
    }]);
    return Desktop;
}();

/**
 * @typedef {Object} desktopSettings
 * @property {string} name
 * @property {string} projectName
 * @property {boolean} devTools
 * @property {boolean} devtron
 * @property {boolean} desktopHCP
 * @property {string} autoUpdateFeedUrl
 * @property {Object} autoUpdateFeedHeaders
 * @property {Object} autoUpdateManualCheck
 * @property {Object} desktopHCPSettings
 * @property {boolean} desktopHCPSettings.ignoreCompatibilityVersion
 * @property {boolean} desktopHCPSettings.blockAppUpdateOnDesktopIncompatibility
 * @property {number} webAppStartupTimeout
 * @property {Object} window
 * @property {Object} windowDev
 * @property {Object} packageJsonFields
 * @property {Object} builderOptions
 * @property {Object} builderCliOptions
 * @property {Object} packagerOptions
 * @property {Object} plugins
 * @property {Object} dependencies
 * @property {boolean} uglify
 * @property {string} version
 **/


exports.default = Desktop;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9kZXNrdG9wLmpzIl0sIm5hbWVzIjpbImNvbmZpZyIsImZhdGFsIiwiaXNFbXB0eVN5bmMiLCJzZWFyY2hQYXRoIiwic3RhdCIsInN0YXRTeW5jIiwiZSIsImlzRGlyZWN0b3J5IiwiaXRlbXMiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIkRlc2t0b3AiLCIkIiwibG9nIiwic2V0dGluZ3MiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlbnYiLCJwYXRocyIsImRlc2t0b3AiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiaW5mbyIsInZlcnNpb24iLCJzeW5jIiwiZmlsZXMiLCJyb290Iiwic2VwIiwidmVyYm9zZSIsIm1vZHVsZVBhdGgiLCJtb2R1bGVDb25maWciLCJqb2luIiwiY29uZmlncyIsIm1vZHVsZXMiLCJscyIsImZvckVhY2giLCJtb2R1bGUiLCJsc3RhdFN5bmMiLCJnZXRNb2R1bGVDb25maWciLCJkaXJOYW1lIiwibmFtZSIsInB1c2giLCJjaGVja01vZHVsZXMiLCJkZXBlbmRlbmNpZXMiLCJmcm9tU2V0dGluZ3MiLCJwbHVnaW5zIiwic2V0dGluZ3NKc29uIiwiZ2V0U2V0dGluZ3MiLCJyZWR1Y2UiLCJwbHVnaW4iLCJtb2R1bGVEZXBlbmRlbmNpZXMiLCJnYXRoZXJNb2R1bGVDb25maWdzIiwidXRpbHMiLCJleGlzdHMiLCJ3YXJuIiwiY3AiLCJzY2FmZm9sZCIsIm1rZGlyIiwiaW1wb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBRUEsa0JBQU1BLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjs7QUFFQTs7Ozs7QUFLQSxTQUFTQyxXQUFULENBQXFCQyxVQUFyQixFQUFpQztBQUM3QixRQUFJQyxhQUFKO0FBQ0EsUUFBSTtBQUNBQSxlQUFPLGFBQUdDLFFBQUgsQ0FBWUYsVUFBWixDQUFQO0FBQ0gsS0FG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TCxDQUFTVyxJQUFULENBQWMsNkJBQWQ7QUFDSDs7QUFFRDs7Ozs7Ozs7Z0NBS1E7QUFDSixpQkFBS1gsR0FBTCxDQUFTaUIsT0FBVCxDQUFpQiw2QkFBakI7QUFDQSxtQkFBTyxDQUFDLEVBQUUsS0FBS2xCLENBQUwsQ0FBTzBDLEtBQVAsQ0FBYUMsTUFBYixDQUFvQixLQUFLM0MsQ0FBTCxDQUFPTSxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCUSxJQUE3QyxLQUNOLEtBQUtoQixDQUFMLENBQU8wQyxLQUFQLENBQWFDLE1BQWIsQ0FBb0IsS0FBSzNDLENBQUwsQ0FBT00sR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5Qk4sUUFBN0MsQ0FETSxJQUVOLEtBQUtGLENBQUwsQ0FBTzBDLEtBQVAsQ0FBYUMsTUFBYixDQUFvQixLQUFLM0MsQ0FBTCxDQUFPTSxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCQSxPQUE3QyxDQUZJLENBQVI7QUFHSDs7Ozs7QUFHTDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQXRMcUJULE8iLCJmaWxlIjoiZGVza3RvcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBoYXNoIGZyb20gJ2hhc2gtZmlsZXMnO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIHBhdGggaXMgZW1wdHkuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoUGF0aFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlTeW5jKHNlYXJjaFBhdGgpIHtcbiAgICBsZXQgc3RhdDtcbiAgICB0cnkge1xuICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMoc2VhcmNoUGF0aCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGZzLnJlYWRkaXJTeW5jKHNlYXJjaFBhdGgpO1xuICAgICAgICByZXR1cm4gIWl0ZW1zIHx8ICFpdGVtcy5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSAuZGVza3RvcCBkaXJlY3RvcnkuXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7ZGVza3RvcFNldHRpbmdzfSBzZXR0aW5nc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNrdG9wIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWV0ZW9yRGVza3RvcH0gJCAtIGNvbnRleHRcbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQpIHtcbiAgICAgICAgdGhpcy4kID0gJDtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdkZXNrdG9wJyk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIHJlYWQgYW5kIHJldHVybnMgc2V0dGluZ3MuanNvbiBjb250ZW50cyBmcm9tIC5kZXNrdG9wIGRpci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtkZXNrdG9wU2V0dGluZ3N8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLnNldHRpbmdzLCAnVVRGLTgnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHRyeWluZyB0byByZWFkIFxcJy5kZXNrdG9wL3NldHRpbmdzLmpzb25cXCc6ICcsIGUpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgdmVyc2lvbiBoYXNoIHJlcHJlc2VudGluZyBjdXJyZW50IC5kZXNrdG9wIGNvbnRlbnRzLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SGFzaFZlcnNpb24oKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2NhbGN1bGF0aW5nIGhhc2ggdmVyc2lvbiBmcm9tIC5kZXNrdG9wIGNvbnRlbnRzJyk7XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBoYXNoLnN5bmMoe1xuICAgICAgICAgICAgZmlsZXM6IFtgJHt0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3Aucm9vdH0ke3BhdGguc2VwfSoqYF1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGNhbGN1bGF0ZWQgLmRlc2t0b3AgaGFzaCB2ZXJzaW9uIGlzICR7dmVyc2lvbn1gKTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gcmVhZCBhIG1vZHVsZS5qc29uIGZpbGUgZnJvbSBhIG1vZHVsZSBhdCBwcm92aWRlZCBwYXRoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZHVsZVBhdGggLSBwYXRoIHRvIHRoZSBtb2R1bGUgZGlyXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRNb2R1bGVDb25maWcobW9kdWxlUGF0aCkge1xuICAgICAgICBsZXQgbW9kdWxlQ29uZmlnID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb2R1bGVDb25maWcgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4obW9kdWxlUGF0aCwgJ21vZHVsZS5qc29uJyksICdVVEYtOCcpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICBgZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIHJlYWQgJ21vZHVsZS5qc29uJyBmcm9tICcke21vZHVsZVBhdGh9JyBtb2R1bGU6IGAsXG4gICAgICAgICAgICAgICAgZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISgnbmFtZScgaW4gbW9kdWxlQ29uZmlnKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYG5vICduYW1lJyBmaWVsZCBkZWZpbmVkIGluICdtb2R1bGUuanNvbicgaW4gJyR7bW9kdWxlUGF0aH0nIG1vZHVsZS5gKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kdWxlQ29uZmlnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjYW5zIGFsbCBtb2R1bGVzIGZvciBtb2R1bGUuanNvbiBhbmQgZ2F0aGVycyB0aGlzIGNvbmZpZ3VyYXRpb24gYWx0b2dldGhlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtbXX1cbiAgICAgKi9cbiAgICBnYXRoZXJNb2R1bGVDb25maWdzKCkge1xuICAgICAgICBjb25zdCBjb25maWdzID0gW107XG5cbiAgICAgICAgaWYgKCFpc0VtcHR5U3luYyh0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3AubW9kdWxlcykpIHtcbiAgICAgICAgICAgIHNoZWxsLmxzKCctZCcsIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3AubW9kdWxlcywgJyonKSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAobW9kdWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmcy5sc3RhdFN5bmMobW9kdWxlKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVDb25maWcgPSB0aGlzLmdldE1vZHVsZUNvbmZpZyhtb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlQ29uZmlnLmRpck5hbWUgPSBwYXRoLnBhcnNlKG1vZHVsZSkubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MucHVzaChtb2R1bGVDb25maWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdW1tYXJpemVzIGFsbCBkZXBlbmRlbmNpZXMgZGVmaW5lZCBpbiAuZGVza3RvcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbXMge09iamVjdH0gc2V0dGluZ3MgICAgICAtIHNldHRpbmdzLmpzb25cbiAgICAgKiBAcGFyYW1zIHtib29sZWFufSBjaGVja01vZHVsZXMgLSB3aGV0aGVyIHRvIGdhdGhlciBtb2R1bGVzIGRlcGVuZGVuY2llc1xuICAgICAqIEByZXR1cm5zIHt7ZnJvbVNldHRpbmdzOiB7fSwgcGx1Z2luczoge30sIG1vZHVsZXM6IHt9fX1cbiAgICAgKi9cbiAgICBnZXREZXBlbmRlbmNpZXMoc2V0dGluZ3MgPSBudWxsLCBjaGVja01vZHVsZXMgPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHtcbiAgICAgICAgICAgIGZyb21TZXR0aW5nczoge30sXG4gICAgICAgICAgICBwbHVnaW5zOiB7fSxcbiAgICAgICAgICAgIG1vZHVsZXM6IHt9XG4gICAgICAgIH07XG4gICAgICAgIC8qKiBAdHlwZSB7ZGVza3RvcFNldHRpbmdzfSAqKi9cbiAgICAgICAgY29uc3Qgc2V0dGluZ3NKc29uID0gc2V0dGluZ3MgfHwgdGhpcy5nZXRTZXR0aW5ncygpO1xuXG4gICAgICAgIC8vIFNldHRpbmdzIGNhbiBoYXZlIGEgJ2RlcGVuZGVuY2llcycgZmllbGQuXG4gICAgICAgIGlmICgnZGVwZW5kZW5jaWVzJyBpbiBzZXR0aW5nc0pzb24pIHtcbiAgICAgICAgICAgIGRlcGVuZGVuY2llcy5mcm9tU2V0dGluZ3MgPSBzZXR0aW5nc0pzb24uZGVwZW5kZW5jaWVzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGx1Z2lucyBhcmUgYWxzbyBhIG5wbSBwYWNrYWdlcy5cbiAgICAgICAgaWYgKCdwbHVnaW5zJyBpbiBzZXR0aW5nc0pzb24pIHtcbiAgICAgICAgICAgIGRlcGVuZGVuY2llcy5wbHVnaW5zID0gT2JqZWN0LmtleXMoc2V0dGluZ3NKc29uLnBsdWdpbnMpLnJlZHVjZSgocGx1Z2lucywgcGx1Z2luKSA9PiB7XG4gICAgICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi9cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzSnNvbi5wbHVnaW5zW3BsdWdpbl0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IHNldHRpbmdzSnNvbi5wbHVnaW5zW3BsdWdpbl0udmVyc2lvbjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBzZXR0aW5nc0pzb24ucGx1Z2luc1twbHVnaW5dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVhY2ggbW9kdWxlIGNhbiBoYXZlIGl0cyBvd24gZGVwZW5kZW5jaWVzIGRlZmluZWQuXG4gICAgICAgIGNvbnN0IG1vZHVsZURlcGVuZGVuY2llcyA9IHt9O1xuICAgICAgICBpZiAoY2hlY2tNb2R1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy5nYXRoZXJNb2R1bGVDb25maWdzKCk7XG5cbiAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAobW9kdWxlQ29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKCdkZXBlbmRlbmNpZXMnIGluIG1vZHVsZUNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUNvbmZpZy5kZXBlbmRlbmNpZXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlQ29uZmlnLm5hbWUgaW4gbW9kdWxlRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihgZHVwbGljYXRlIG5hbWUgJyR7bW9kdWxlQ29uZmlnLm5hbWV9JyBpbiAnbW9kdWxlLmpzb24nIGluIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAnJHttb2R1bGVDb25maWcuZGlyTmFtZX0nIC0gYW5vdGhlciBtb2R1bGUgYWxyZWFkeSByZWdpc3RlcmVkIHRoZSBzYW1lIG5hbWUuYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlRGVwZW5kZW5jaWVzW21vZHVsZUNvbmZpZy5uYW1lXSA9IG1vZHVsZUNvbmZpZy5kZXBlbmRlbmNpZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlcGVuZGVuY2llcy5tb2R1bGVzID0gbW9kdWxlRGVwZW5kZW5jaWVzO1xuICAgICAgICByZXR1cm4gZGVwZW5kZW5jaWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGUgLmRlc2t0b3Agc2NhZmZvbGQgaW50byB0aGUgbWV0ZW9yIGFwcCBkaXIuXG4gICAgICogQWRkcyBlbnRyeSB0byAubWV0ZW9yLy5naXRpZ25vcmUuXG4gICAgICovXG4gICAgc2NhZmZvbGQoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2NyZWF0aW5nIC5kZXNrdG9wIHNjYWZmb2xkIGluIHlvdXIgcHJvamVjdCcpO1xuXG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5yb290KSkge1xuICAgICAgICAgICAgdGhpcy5sb2cud2FybignLmRlc2t0b3AgYWxyZWFkeSBleGlzdHMgLSBkZWxldGUgaXQgaWYgeW91IHdhbnQgYSBuZXcgb25lIHRvIGJlICcgK1xuICAgICAgICAgICAgICAgICdjcmVhdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzaGVsbC5jcCgnLXInLCB0aGlzLiQuZW52LnBhdGhzLnNjYWZmb2xkLCB0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3Aucm9vdCk7XG4gICAgICAgIHNoZWxsLm1rZGlyKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5pbXBvcnQpO1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCcuZGVza3RvcCBkaXJlY3RvcnkgcHJlcGFyZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWZXJpZmllcyBpZiBhbGwgbWFuZGF0b3J5IGZpbGVzIGFyZSBwcmVzZW50IGluIHRoZSAuZGVza3RvcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGNoZWNrKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjaGVja2luZyAuZGVza3RvcCBleGlzdGVuY2UnKTtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLnJvb3QpICYmXG4gICAgICAgICAgICB0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5zZXR0aW5ncykgJiZcbiAgICAgICAgICAgIHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLmRlc2t0b3ApKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gZGVza3RvcFNldHRpbmdzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByb2plY3ROYW1lXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRldlRvb2xzXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRldnRyb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZGVza3RvcEhDUFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGF1dG9VcGRhdGVGZWVkVXJsXG4gKiBAcHJvcGVydHkge09iamVjdH0gYXV0b1VwZGF0ZUZlZWRIZWFkZXJzXG4gKiBAcHJvcGVydHkge09iamVjdH0gYXV0b1VwZGF0ZU1hbnVhbENoZWNrXG4gKiBAcHJvcGVydHkge09iamVjdH0gZGVza3RvcEhDUFNldHRpbmdzXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRlc2t0b3BIQ1BTZXR0aW5ncy5pZ25vcmVDb21wYXRpYmlsaXR5VmVyc2lvblxuICogQHByb3BlcnR5IHtib29sZWFufSBkZXNrdG9wSENQU2V0dGluZ3MuYmxvY2tBcHBVcGRhdGVPbkRlc2t0b3BJbmNvbXBhdGliaWxpdHlcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3ZWJBcHBTdGFydHVwVGltZW91dFxuICogQHByb3BlcnR5IHtPYmplY3R9IHdpbmRvd1xuICogQHByb3BlcnR5IHtPYmplY3R9IHdpbmRvd0RldlxuICogQHByb3BlcnR5IHtPYmplY3R9IHBhY2thZ2VKc29uRmllbGRzXG4gKiBAcHJvcGVydHkge09iamVjdH0gYnVpbGRlck9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBidWlsZGVyQ2xpT3B0aW9uc1xuICogQHByb3BlcnR5IHtPYmplY3R9IHBhY2thZ2VyT3B0aW9uc1xuICogQHByb3BlcnR5IHtPYmplY3R9IHBsdWdpbnNcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkZXBlbmRlbmNpZXNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdWdsaWZ5XG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmVyc2lvblxuICoqL1xuIl19