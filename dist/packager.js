'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assignIn = require('lodash/assignIn');

var _assignIn2 = _interopRequireDefault(_assignIn);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _electronPackager = require('electron-packager');

var _electronPackager2 = _interopRequireDefault(_electronPackager);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var join = _path2.default.join;

/**
 * Wrapper around electron-packager.
 * @class
 */

var ElectronPackager = function () {
    function ElectronPackager($) {
        (0, _classCallCheck3.default)(this, ElectronPackager);

        this.log = new _log2.default('electron-packager');
        this.$ = $;
    }

    /**
     * Runs the packager with provided arguments.
     *
     * @param {Object} args
     * @returns {Promise}
     */


    (0, _createClass3.default)(ElectronPackager, [{
        key: 'runPackager',
        value: function runPackager(args) {
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                (0, _electronPackager2.default)(args, function (err, appPath) {
                    if (err) {
                        reject(err);
                    } else {
                        _this.log.info('wrote packaged app to ' + _this.$.env.paths.packageDir);

                        var promises = [];
                        appPath.forEach(function (builtAppPath) {
                            var appPathParsed = _path2.default.parse(builtAppPath);
                            promises.push(_this.$.utils.rmWithRetries('-rf', _path2.default.join(_this.$.env.paths.packageDir, appPathParsed.base, 'resources', 'app', 'node_modules')));
                        });
                        _promise2.default.all(promises).then(function () {
                            resolve();
                        }).catch(function (e) {
                            reject(e);
                        });
                    }
                });
            });
        }
    }, {
        key: 'packageApp',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this2 = this;

                var version, settings, name, arch, args, packagerOptions;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                version = JSON.parse(_fs2.default.readFileSync(join(this.$.env.paths.meteorApp.root, 'node_modules', 'electron', 'package.json'), 'UTF-8')).version;
                                settings = this.$.desktop.getSettings();
                                name = settings.name;

                                if (!name) {
                                    this.log.error('`name` field in settings.json not set');
                                    process.exit(1);
                                }

                                arch = this.$.env.options.ia32 ? 'ia32' : 'x64';


                                this.log.info('packaging \'' + name + '\' for platform \'' + this.$.env.sys.platform + '-' + arch + '\'' + (' using electron v' + version));

                                _context.prev = 6;
                                _context.next = 9;
                                return this.$.utils.rmWithRetries('-rf', _path2.default.join(this.$.env.options.output, this.$.env.paths.packageDir));

                            case 9:
                                _context.next = 14;
                                break;

                            case 11:
                                _context.prev = 11;
                                _context.t0 = _context['catch'](6);
                                throw new Error(_context.t0);

                            case 14:
                                args = {
                                    name: name,
                                    version: version,
                                    arch: arch,
                                    platform: this.$.env.sys.platform,
                                    dir: this.$.env.paths.electronApp.root,
                                    out: _path2.default.join(this.$.env.options.output, this.$.env.paths.packageDir)
                                };


                                if ('packagerOptions' in settings) {
                                    packagerOptions = settings.packagerOptions;


                                    ['windows', 'linux', 'osx'].forEach(function (system) {
                                        if (_this2.$.env.os['is' + system[0].toUpperCase() + system.substring(1)] && '_' + system in packagerOptions) {
                                            (0, _assignIn2.default)(packagerOptions, packagerOptions['_' + system]);
                                        }
                                    });

                                    if ('version-string' in packagerOptions) {
                                        (0, _keys2.default)(packagerOptions['version-string']).forEach(function (field) {
                                            if (packagerOptions['version-string'][field] === '@version') {
                                                packagerOptions['version-string'][field] = settings.version;
                                            }
                                        });
                                    }
                                    (0, _assignIn2.default)(args, packagerOptions);
                                }

                                // Move node_modules away. We do not want to delete it, just temporarily remove it from
                                // our way.
                                _shelljs2.default.mv(this.$.env.paths.electronApp.nodeModules, this.$.env.paths.electronApp.tmpNodeModules);

                                _context.prev = 17;
                                _context.next = 20;
                                return this.runPackager(args);

                            case 20:
                                _context.prev = 20;

                                // Move node_modules back.
                                _shelljs2.default.mv(this.$.env.paths.electronApp.tmpNodeModules, this.$.env.paths.electronApp.nodeModules);
                                return _context.finish(20);

                            case 23:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[6, 11], [17,, 20, 23]]);
            }));

            function packageApp() {
                return _ref.apply(this, arguments);
            }

            return packageApp;
        }()
    }]);
    return ElectronPackager;
}();

exports.default = ElectronPackager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9wYWNrYWdlci5qcyJdLCJuYW1lcyI6WyJqb2luIiwiRWxlY3Ryb25QYWNrYWdlciIsIiQiLCJsb2ciLCJhcmdzIiwicmVzb2x2ZSIsInJlamVjdCIsImVyciIsImFwcFBhdGgiLCJpbmZvIiwiZW52IiwicGF0aHMiLCJwYWNrYWdlRGlyIiwicHJvbWlzZXMiLCJmb3JFYWNoIiwiYnVpbHRBcHBQYXRoIiwiYXBwUGF0aFBhcnNlZCIsInBhcnNlIiwicHVzaCIsInV0aWxzIiwicm1XaXRoUmV0cmllcyIsImJhc2UiLCJhbGwiLCJ0aGVuIiwiY2F0Y2giLCJlIiwidmVyc2lvbiIsIkpTT04iLCJyZWFkRmlsZVN5bmMiLCJtZXRlb3JBcHAiLCJyb290Iiwic2V0dGluZ3MiLCJkZXNrdG9wIiwiZ2V0U2V0dGluZ3MiLCJuYW1lIiwiZXJyb3IiLCJwcm9jZXNzIiwiZXhpdCIsImFyY2giLCJvcHRpb25zIiwiaWEzMiIsInN5cyIsInBsYXRmb3JtIiwib3V0cHV0IiwiRXJyb3IiLCJkaXIiLCJlbGVjdHJvbkFwcCIsIm91dCIsInBhY2thZ2VyT3B0aW9ucyIsInN5c3RlbSIsIm9zIiwidG9VcHBlckNhc2UiLCJzdWJzdHJpbmciLCJmaWVsZCIsIm12Iiwibm9kZU1vZHVsZXMiLCJ0bXBOb2RlTW9kdWxlcyIsInJ1blBhY2thZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztJQUVRQSxJLGtCQUFBQSxJOztBQUVSOzs7OztJQUlxQkMsZ0I7QUFFakIsOEJBQVlDLENBQVosRUFBZTtBQUFBOztBQUNYLGFBQUtDLEdBQUwsR0FBVyxrQkFBUSxtQkFBUixDQUFYO0FBQ0EsYUFBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7b0NBTVlFLEksRUFBTTtBQUFBOztBQUNkLG1CQUFPLHNCQUFZLFVBQUNDLE9BQUQs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QUFXQyxLQUFYLENBQWlCbUMsV0FBakIsQ0FBNkJVLGNBRGpDLEVBRUksS0FBS3RELENBQUwsQ0FBT1EsR0FBUCxDQUFXQyxLQUFYLENBQWlCbUMsV0FBakIsQ0FBNkJTLFdBRmpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBbkhTdEQsZ0IiLCJmaWxlIjoicGFja2FnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzaWduSW4gZnJvbSAnbG9kYXNoL2Fzc2lnbkluJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBwYWNrYWdlciBmcm9tICdlbGVjdHJvbi1wYWNrYWdlcic7XG5cbmltcG9ydCBMb2cgZnJvbSAnLi9sb2cnO1xuXG5jb25zdCB7IGpvaW4gfSA9IHBhdGg7XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgZWxlY3Ryb24tcGFja2FnZXIuXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlY3Ryb25QYWNrYWdlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZWxlY3Ryb24tcGFja2FnZXInKTtcbiAgICAgICAgdGhpcy4kID0gJDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHRoZSBwYWNrYWdlciB3aXRoIHByb3ZpZGVkIGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgcnVuUGFja2FnZXIoYXJncykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcGFja2FnZXIoYXJncywgKGVyciwgYXBwUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbyhgd3JvdGUgcGFja2FnZWQgYXBwIHRvICR7dGhpcy4kLmVudi5wYXRocy5wYWNrYWdlRGlyfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGFwcFBhdGguZm9yRWFjaCgoYnVpbHRBcHBQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHBQYXRoUGFyc2VkID0gcGF0aC5wYXJzZShidWlsdEFwcFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLiQudXRpbHMucm1XaXRoUmV0cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLXJmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMucGFja2FnZURpcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwUGF0aFBhcnNlZC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVzb3VyY2VzJywgJ2FwcCcsICdub2RlX21vZHVsZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBwYWNrYWdlQXBwKCkge1xuICAgICAgICBjb25zdCB2ZXJzaW9uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgJ25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgJ2VsZWN0cm9uJyxcbiAgICAgICAgICAgICAgICAncGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgKSwgJ1VURi04JylcbiAgICAgICAgKS52ZXJzaW9uO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgICAgIGlmICghbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2BuYW1lYCBmaWVsZCBpbiBzZXR0aW5ncy5qc29uIG5vdCBzZXQnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFyY2ggPSB0aGlzLiQuZW52Lm9wdGlvbnMuaWEzMiA/ICdpYTMyJyA6ICd4NjQnO1xuXG4gICAgICAgIHRoaXMubG9nLmluZm8oXG4gICAgICAgICAgICBgcGFja2FnaW5nICcke25hbWV9JyBmb3IgcGxhdGZvcm0gJyR7dGhpcy4kLmVudi5zeXMucGxhdGZvcm19LSR7YXJjaH0nYCArXG4gICAgICAgICAgICBgIHVzaW5nIGVsZWN0cm9uIHYke3ZlcnNpb259YFxuICAgICAgICApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLiQudXRpbHMucm1XaXRoUmV0cmllcyhcbiAgICAgICAgICAgICAgICAnLXJmJywgcGF0aC5qb2luKHRoaXMuJC5lbnYub3B0aW9ucy5vdXRwdXQsIHRoaXMuJC5lbnYucGF0aHMucGFja2FnZURpcikpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmdzID0ge1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICBhcmNoLFxuICAgICAgICAgICAgcGxhdGZvcm06IHRoaXMuJC5lbnYuc3lzLnBsYXRmb3JtLFxuICAgICAgICAgICAgZGlyOiB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsXG4gICAgICAgICAgICBvdXQ6IHBhdGguam9pbih0aGlzLiQuZW52Lm9wdGlvbnMub3V0cHV0LCB0aGlzLiQuZW52LnBhdGhzLnBhY2thZ2VEaXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCdwYWNrYWdlck9wdGlvbnMnIGluIHNldHRpbmdzKSB7XG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlck9wdGlvbnMgPSBzZXR0aW5ncy5wYWNrYWdlck9wdGlvbnM7XG5cbiAgICAgICAgICAgIFsnd2luZG93cycsICdsaW51eCcsICdvc3gnXS5mb3JFYWNoKChzeXN0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYub3NbYGlzJHtzeXN0ZW1bMF0udG9VcHBlckNhc2UoKX0ke3N5c3RlbS5zdWJzdHJpbmcoMSl9YF0gJiZcbiAgICAgICAgICAgICAgICAgICAgKGBfJHtzeXN0ZW19YCkgaW4gcGFja2FnZXJPcHRpb25zXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2lnbkluKHBhY2thZ2VyT3B0aW9ucywgcGFja2FnZXJPcHRpb25zW2BfJHtzeXN0ZW19YF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoJ3ZlcnNpb24tc3RyaW5nJyBpbiBwYWNrYWdlck9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwYWNrYWdlck9wdGlvbnNbJ3ZlcnNpb24tc3RyaW5nJ10pLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWNrYWdlck9wdGlvbnNbJ3ZlcnNpb24tc3RyaW5nJ11bZmllbGRdID09PSAnQHZlcnNpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlck9wdGlvbnNbJ3ZlcnNpb24tc3RyaW5nJ11bZmllbGRdID0gc2V0dGluZ3MudmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXNzaWduSW4oYXJncywgcGFja2FnZXJPcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdmUgbm9kZV9tb2R1bGVzIGF3YXkuIFdlIGRvIG5vdCB3YW50IHRvIGRlbGV0ZSBpdCwganVzdCB0ZW1wb3JhcmlseSByZW1vdmUgaXQgZnJvbVxuICAgICAgICAvLyBvdXIgd2F5LlxuICAgICAgICBzaGVsbC5tdihcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMsXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuUGFja2FnZXIoYXJncyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAvLyBNb3ZlIG5vZGVfbW9kdWxlcyBiYWNrLlxuICAgICAgICAgICAgc2hlbGwubXYoXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlcyxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19