'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _assignIn = require('lodash/assignIn');

var _assignIn2 = _interopRequireDefault(_assignIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var join = _path2.default.join;

/**
 * @class
 * @property {paths} paths
 */

var Env = function () {
    function Env(input, output, options) {
        (0, _classCallCheck3.default)(this, Env);

        this.options = options;

        if (this.isProductionBuild()) {
            process.env.NODE_ENV = 'production';
        }

        this.sys = {
            platform: process.platform,
            arch: process.arch
        };

        // Operational System.
        this.os = {
            isWindows: process.platform === 'win32',
            isLinux: process.platform === 'linux',
            isOsx: process.platform === 'darwin'

        };
        this.stdio = 'inherit';

        this.os.name = this.sys.platform === 'darwin' ? 'osx' : this.sys.platform;
        this.os.home = process.env[this.os.isWindows ? 'USERPROFILE' : 'HOME'];
        this.os.tmp = _os2.default.tmpdir();

        /** @type {paths} **/
        this.paths = {};

        /** @type {meteorDesktopPaths} **/
        this.paths.meteorDesktop = {
            root: _path2.default.resolve(__dirname, '..')
        };

        this.paths.meteorDesktop.skeleton = join(this.paths.meteorDesktop.root, 'skeleton');

        /** @type {meteorAppPaths} **/
        this.paths.meteorApp = {
            root: input
        };

        /** @type {desktopPaths} **/
        this.paths.desktop = {
            rootName: '.desktop',
            root: join(this.paths.meteorApp.root, '.desktop')
        };

        (0, _assignIn2.default)(this.paths.desktop, {
            modules: join(this.paths.desktop.root, 'modules'),
            import: join(this.paths.desktop.root, 'import'),
            assets: join(this.paths.desktop.root, 'assets'),
            settings: join(this.paths.desktop.root, 'settings.json'),
            desktop: join(this.paths.desktop.root, 'desktop.js')
        });

        this.paths.desktop.splashScreen = join(this.paths.desktop.assets, 'splashScreen.png');
        this.paths.desktop.loadingGif = join(this.paths.desktop.assets, 'loading.gif');
        this.paths.desktop.meteorIco = join(this.paths.desktop.assets, 'meteor.ico');

        /** @type {electronAppPaths} **/
        this.paths.electronApp = {
            rootName: 'desktop-build'
        };
        this.paths.electronApp.root = join(this.paths.meteorApp.root, '.meteor', this.paths.electronApp.rootName);

        this.paths.electronApp.tmpNodeModules = join(this.paths.meteorApp.root, '.meteor', '.desktop_node_modules');

        this.paths.electronApp.appRoot = join(this.paths.electronApp.root, 'app');

        (0, _assignIn2.default)(this.paths.electronApp, {
            app: join(this.paths.electronApp.appRoot, 'app.js'),
            cordova: join(this.paths.electronApp.appRoot, 'cordova.js'),
            index: join(this.paths.electronApp.appRoot, 'index.js'),
            preload: join(this.paths.electronApp.appRoot, 'preload.js'),
            modules: join(this.paths.electronApp.appRoot, 'modules'),
            desktopAsar: join(this.paths.electronApp.root, 'desktop.asar'),
            extracted: join(this.paths.electronApp.root, 'extracted'),
            appAsar: join(this.paths.electronApp.root, 'app.asar'),
            import: join(this.paths.electronApp.root, 'import'),
            assets: join(this.paths.electronApp.root, 'assets'),
            packageJson: join(this.paths.electronApp.root, 'package.json'),
            settings: join(this.paths.electronApp.root, 'settings.json'),
            desktop: join(this.paths.electronApp.root, 'desktop.js'),
            desktopTmp: join(this.paths.electronApp.root, '__desktop'),
            nodeModules: join(this.paths.electronApp.root, 'node_modules'),
            meteorAsar: join(this.paths.electronApp.root, 'meteor.asar'),
            meteorApp: join(this.paths.electronApp.root, 'meteor'),
            meteorAppIndex: join(this.paths.electronApp.root, 'meteor', 'index.html'),
            meteorAppProgramJson: join(this.paths.electronApp.root, 'meteor', 'program.json'),
            skeleton: join(this.paths.electronApp.root, 'skeleton')
        });

        (0, _assignIn2.default)(this.paths.meteorApp, {
            platforms: join(this.paths.meteorApp.root, '.meteor', 'platforms'),
            packages: join(this.paths.meteorApp.root, '.meteor', 'packages'),
            versions: join(this.paths.meteorApp.root, '.meteor', 'versions'),
            release: join(this.paths.meteorApp.root, '.meteor', 'release'),
            packageJson: join(this.paths.meteorApp.root, 'package.json'),
            gitIgnore: join(this.paths.meteorApp.root, '.meteor', '.gitignore'),
            cordovaBuild: join(this.paths.meteorApp.root, '.meteor', 'local', 'cordova-build', 'www', 'application'),
            webCordova: join(this.paths.meteorApp.root, '.meteor', 'local', 'build', 'programs', 'web.cordova')
        });

        (0, _assignIn2.default)(this.paths.meteorApp, {
            cordovaBuildIndex: join(this.paths.meteorApp.cordovaBuild, 'index.html'),
            cordovaBuildProgramJson: join(this.paths.meteorApp.cordovaBuild, 'program.json')
        });

        (0, _assignIn2.default)(this.paths.meteorApp, {
            webCordovaProgramJson: join(this.paths.meteorApp.webCordova, 'program.json')
        });

        /** @type {desktopTmpPaths} **/
        this.paths.desktopTmp = {
            root: join(this.paths.electronApp.root, '__desktop')
        };

        (0, _assignIn2.default)(this.paths.desktopTmp, {
            modules: join(this.paths.desktopTmp.root, 'modules'),
            settings: join(this.paths.desktopTmp.root, 'settings.json')
        });

        this.paths.packageDir = '.desktop-package';
        this.paths.installerDir = '.desktop-installer';

        // Scaffold
        this.paths.scaffold = join(__dirname, '..', 'scaffold');
    }

    /**
     * @returns {boolean|*}
     * @public
     */


    (0, _createClass3.default)(Env, [{
        key: 'isProductionBuild',
        value: function isProductionBuild() {
            return !!('production' in this.options && this.options.production);
        }
    }]);
    return Env;
}();

exports.default = Env;


module.exports = Env;

/**
 * @typedef {Object} desktopPaths
 * @property {string} rootName
 * @property {string} root
 * @property {string} modules
 * @property {string} import
 * @property {string} assets
 * @property {string} settings
 * @property {string} desktop
 * @property {string} splashScreen
 * @property {string} loadingGif
 * @property {string} meteorIco
 */

/**
 * @typedef {Object} meteorAppPaths
 * @property {string} root
 * @property {string} platforms
 * @property {string} release
 * @property {string} packages
 * @property {string} versions
 * @property {string} gitIgnore
 * @property {string} packageJson
 * @property {string} cordovaBuild
 * @property {string} cordovaBuildIndex
 * @property {string} cordovaBuildProgramJson
 * @property {string} webCordova
 * @property {string} webCordovaIndex
 * @property {string} webCordovaProgramJson
 */

/** @typedef {Object} electronAppPaths
 * @property {string} rootName
 * @property {string} root
 * @property {Object} appRoot
 * @property {string} appRoot.cordova
 * @property {string} appRoot.index
 * @property {string} appRoot.app
 * @property {string} appRoot.modules
 * @property {string} desktopAsar
 * @property {string} extracted
 * @property {string} appAsar
 * @property {string} preload
 * @property {string} import
 * @property {string} assets
 * @property {string} gitIgnore
 * @property {string} packageJson
 * @property {string} settings
 * @property {string} desktop
 * @property {string} desktopTmp
 * @property {string} nodeModules
 * @property {string} meteorAsar
 * @property {string} meteorApp
 * @property {string} meteorAppIndex
 * @property {string} meteorAppProgramJson
 * @property {string} skeleton
 * @property {string} tmpNodeModules
 */

/**
 * @typedef {Object} desktopTmpPaths
 * @property {string} root
 * @property {string} modules
 * @property {string} settings
 */

/**
 * @typedef {Object} meteorDesktopPaths
 * @property {string} root
 * @property {string} skeleton
 */

/** @typedef {Object} paths
 * @property {meteorAppPaths} meteorApp
 * @property {desktopPaths} desktop
 * @property {electronAppPaths} electronApp
 * @property {desktopTmpPaths} desktopTmp
 * @property {meteorDesktopPaths} meteorDesktop
 * @property {string} packageDir
 * @property {string} scaffold
 */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbnYuanMiXSwibmFtZXMiOlsiam9pbiIsIkVudiIsImlucHV0Iiwib3V0cHV0Iiwib3B0aW9ucyIsImlzUHJvZHVjdGlvbkJ1aWxkIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwic3lzIiwicGxhdGZvcm0iLCJhcmNoIiwib3MiLCJpc1dpbmRvd3MiLCJpc0xpbnV4IiwiaXNPc3giLCJzdGRpbyIsIm5hbWUiLCJob21lIiwidG1wIiwidG1wZGlyIiwicGF0aHMiLCJtZXRlb3JEZXNrdG9wIiwicm9vdCIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJza2VsZXRvbiIsIm1ldGVvckFwcCIsImRlc2t0b3AiLCJyb290TmFtZSIsIm1vZHVsZXMiLCJpbXBvcnQiLCJhc3NldHMiLCJzZXR0aW5ncyIsInNwbGFzaFNjcmVlbiIsImxvYWRpbmdHaWYiLCJtZXRlb3JJY28iLCJlbGVjdHJvbkFwcCIsInRtcE5vZGVNb2R1bGVzIiwiYXBwUm9vdCIsImFwcCIsImNvcmRvdmEiLCJpbmRleCIsInByZWxvYWQiLCJkZXNrdG9wQXNhciIsImV4dHJhY3RlZCIsImFwcEFzYXIiLCJwYWNrYWdlSnNvbiIsImRlc2t0b3BUbXAiLCJub2RlTW9kdWxlcyIsIm1ldGVvckFzYXIiLCJtZXRlb3JBcHBJbmRleCIsIm1ldGVvckFwcFByb2dyYW1Kc29uIiwicGxhdGZvcm1zIiwicGFja2FnZXMiLCJ2ZXJzaW9ucyIsInJlbGVhc2UiLCJnaXRJZ25vcmUiLCJjb3Jkb3ZhQnVpbGQiLCJ3ZWJDb3Jkb3ZhIiwiY29yZG92YUJ1aWxkSW5kZXgiLCJjb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiIsIndlYkNvcmRvdmFQcm9ncmFtSnNvbiIsInBhY2thZ2VEaXIiLCJpbnN0YWxsZXJEaXIiLCJzY2FmZm9sZCIsInByb2R1Y3Rpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0lBRVFBLEks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QUExQjs7QUFFQTtBQUNBLGFBQUszQyxLQUFMLENBQVc0QyxRQUFYLEdBQXNCakUsS0FBS3lCLFNBQUwsRUFBZ0IsSUFBaEIsRUFBc0IsVUFBdEIsQ0FBdEI7QUFDSDs7QUFFRDs7Ozs7Ozs7NENBSW9CO0FBQ2hCLG1CQUFPLENBQUMsRUFBRSxnQkFBZ0IsS0FBS3JCLE9BQXJCLElBQWdDLEtBQUtBLE9BQUwsQ0FBYThELFVBQS9DLENBQVI7QUFDSDs7Ozs7a0JBOUpnQmpFLEc7OztBQWlLckJrRSxPQUFPQyxPQUFQLEdBQWlCbkUsR0FBakI7O0FBRUE7Ozs7Ozs7Ozs7Ozs7O0FBY0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBOzs7Ozs7O0FBT0E7Ozs7OztBQU1BIiwiZmlsZSI6ImVudi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBhc3NpZ25JbiBmcm9tICdsb2Rhc2gvYXNzaWduSW4nO1xuXG5jb25zdCB7IGpvaW4gfSA9IHBhdGg7XG5cbi8qKlxuICogQGNsYXNzXG4gKiBAcHJvcGVydHkge3BhdGhzfSBwYXRoc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnYge1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXQsIG91dHB1dCwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIGlmICh0aGlzLmlzUHJvZHVjdGlvbkJ1aWxkKCkpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID0gJ3Byb2R1Y3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zeXMgPSB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgICAgICAgIGFyY2g6IHByb2Nlc3MuYXJjaFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE9wZXJhdGlvbmFsIFN5c3RlbS5cbiAgICAgICAgdGhpcy5vcyA9IHtcbiAgICAgICAgICAgIGlzV2luZG93czogKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpLFxuICAgICAgICAgICAgaXNMaW51eDogKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcpLFxuICAgICAgICAgICAgaXNPc3g6IChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJylcblxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnN0ZGlvID0gJ2luaGVyaXQnO1xuXG4gICAgICAgIHRoaXMub3MubmFtZSA9ICh0aGlzLnN5cy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyAnb3N4JyA6IHRoaXMuc3lzLnBsYXRmb3JtKTtcbiAgICAgICAgdGhpcy5vcy5ob21lID0gcHJvY2Vzcy5lbnZbKHRoaXMub3MuaXNXaW5kb3dzID8gJ1VTRVJQUk9GSUxFJyA6ICdIT01FJyldO1xuICAgICAgICB0aGlzLm9zLnRtcCA9IG9zLnRtcGRpcigpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7cGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzID0ge307XG5cbiAgICAgICAgLyoqIEB0eXBlIHttZXRlb3JEZXNrdG9wUGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckRlc2t0b3AgPSB7XG4gICAgICAgICAgICByb290OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGF0aHMubWV0ZW9yRGVza3RvcC5za2VsZXRvbiA9IGpvaW4odGhpcy5wYXRocy5tZXRlb3JEZXNrdG9wLnJvb3QsICdza2VsZXRvbicpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7bWV0ZW9yQXBwUGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckFwcCA9IHtcbiAgICAgICAgICAgIHJvb3Q6IGlucHV0XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqIEB0eXBlIHtkZXNrdG9wUGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzLmRlc2t0b3AgPSB7XG4gICAgICAgICAgICByb290TmFtZTogJy5kZXNrdG9wJyxcbiAgICAgICAgICAgIHJvb3Q6IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5kZXNrdG9wJylcbiAgICAgICAgfTtcblxuICAgICAgICBhc3NpZ25Jbih0aGlzLnBhdGhzLmRlc2t0b3AsIHtcbiAgICAgICAgICAgIG1vZHVsZXM6IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLnJvb3QsICdtb2R1bGVzJyksXG4gICAgICAgICAgICBpbXBvcnQ6IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLnJvb3QsICdpbXBvcnQnKSxcbiAgICAgICAgICAgIGFzc2V0czogam9pbih0aGlzLnBhdGhzLmRlc2t0b3Aucm9vdCwgJ2Fzc2V0cycpLFxuICAgICAgICAgICAgc2V0dGluZ3M6IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLnJvb3QsICdzZXR0aW5ncy5qc29uJyksXG4gICAgICAgICAgICBkZXNrdG9wOiBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5yb290LCAnZGVza3RvcC5qcycpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGF0aHMuZGVza3RvcC5zcGxhc2hTY3JlZW4gPSBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5hc3NldHMsICdzcGxhc2hTY3JlZW4ucG5nJyk7XG4gICAgICAgIHRoaXMucGF0aHMuZGVza3RvcC5sb2FkaW5nR2lmID0gam9pbih0aGlzLnBhdGhzLmRlc2t0b3AuYXNzZXRzLCAnbG9hZGluZy5naWYnKTtcbiAgICAgICAgdGhpcy5wYXRocy5kZXNrdG9wLm1ldGVvckljbyA9IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLmFzc2V0cywgJ21ldGVvci5pY28nKTtcblxuICAgICAgICAvKiogQHR5cGUge2VsZWN0cm9uQXBwUGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwID0ge1xuICAgICAgICAgICAgcm9vdE5hbWU6ICdkZXNrdG9wLWJ1aWxkJyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290ID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lKTtcblxuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAnLmRlc2t0b3Bfbm9kZV9tb2R1bGVzJyk7XG5cblxuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QgPVxuICAgICAgICAgICAgam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdhcHAnKTtcblxuICAgICAgICBhc3NpZ25Jbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLCB7XG4gICAgICAgICAgICBhcHA6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5hcHBSb290LCAnYXBwLmpzJyksXG4gICAgICAgICAgICBjb3Jkb3ZhOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ2NvcmRvdmEuanMnKSxcbiAgICAgICAgICAgIGluZGV4OiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ2luZGV4LmpzJyksXG4gICAgICAgICAgICBwcmVsb2FkOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ3ByZWxvYWQuanMnKSxcbiAgICAgICAgICAgIG1vZHVsZXM6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5hcHBSb290LCAnbW9kdWxlcycpLFxuICAgICAgICAgICAgZGVza3RvcEFzYXI6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnZGVza3RvcC5hc2FyJyksXG4gICAgICAgICAgICBleHRyYWN0ZWQ6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnZXh0cmFjdGVkJyksXG4gICAgICAgICAgICBhcHBBc2FyOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2FwcC5hc2FyJyksXG4gICAgICAgICAgICBpbXBvcnQ6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnaW1wb3J0JyksXG4gICAgICAgICAgICBhc3NldHM6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnYXNzZXRzJyksXG4gICAgICAgICAgICBwYWNrYWdlSnNvbjogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdwYWNrYWdlLmpzb24nKSxcbiAgICAgICAgICAgIHNldHRpbmdzOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ3NldHRpbmdzLmpzb24nKSxcbiAgICAgICAgICAgIGRlc2t0b3A6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnZGVza3RvcC5qcycpLFxuICAgICAgICAgICAgZGVza3RvcFRtcDogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdfX2Rlc2t0b3AnKSxcbiAgICAgICAgICAgIG5vZGVNb2R1bGVzOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ25vZGVfbW9kdWxlcycpLFxuICAgICAgICAgICAgbWV0ZW9yQXNhcjogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdtZXRlb3IuYXNhcicpLFxuICAgICAgICAgICAgbWV0ZW9yQXBwOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ21ldGVvcicpLFxuICAgICAgICAgICAgbWV0ZW9yQXBwSW5kZXg6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnbWV0ZW9yJywgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgICAgIG1ldGVvckFwcFByb2dyYW1Kc29uOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ21ldGVvcicsICdwcm9ncmFtLmpzb24nKSxcbiAgICAgICAgICAgIHNrZWxldG9uOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ3NrZWxldG9uJylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXNzaWduSW4odGhpcy5wYXRocy5tZXRlb3JBcHAsIHtcbiAgICAgICAgICAgIHBsYXRmb3Jtczogam9pbih0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LCAnLm1ldGVvcicsICdwbGF0Zm9ybXMnKSxcbiAgICAgICAgICAgIHBhY2thZ2VzOiBqb2luKHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsICcubWV0ZW9yJywgJ3BhY2thZ2VzJyksXG4gICAgICAgICAgICB2ZXJzaW9uczogam9pbih0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LCAnLm1ldGVvcicsICd2ZXJzaW9ucycpLFxuICAgICAgICAgICAgcmVsZWFzZTogam9pbih0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LCAnLm1ldGVvcicsICdyZWxlYXNlJyksXG4gICAgICAgICAgICBwYWNrYWdlSnNvbjogam9pbih0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LCAncGFja2FnZS5qc29uJyksXG4gICAgICAgICAgICBnaXRJZ25vcmU6IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAnLmdpdGlnbm9yZScpLFxuICAgICAgICAgICAgY29yZG92YUJ1aWxkOiBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgJy5tZXRlb3InLFxuICAgICAgICAgICAgICAgICdsb2NhbCcsXG4gICAgICAgICAgICAgICAgJ2NvcmRvdmEtYnVpbGQnLFxuICAgICAgICAgICAgICAgICd3d3cnLFxuICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbidcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB3ZWJDb3Jkb3ZhOiBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgJy5tZXRlb3InLFxuICAgICAgICAgICAgICAgICdsb2NhbCcsXG4gICAgICAgICAgICAgICAgJ2J1aWxkJyxcbiAgICAgICAgICAgICAgICAncHJvZ3JhbXMnLFxuICAgICAgICAgICAgICAgICd3ZWIuY29yZG92YSdcbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXNzaWduSW4odGhpcy5wYXRocy5tZXRlb3JBcHAsIHtcbiAgICAgICAgICAgIGNvcmRvdmFCdWlsZEluZGV4OiBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwLmNvcmRvdmFCdWlsZCwgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgICAgIGNvcmRvdmFCdWlsZFByb2dyYW1Kc29uOiBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwLmNvcmRvdmFCdWlsZCwgJ3Byb2dyYW0uanNvbicpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFzc2lnbkluKHRoaXMucGF0aHMubWV0ZW9yQXBwLCB7XG4gICAgICAgICAgICB3ZWJDb3Jkb3ZhUHJvZ3JhbUpzb246IGpvaW4oXG4gICAgICAgICAgICAgICAgdGhpcy5wYXRocy5tZXRlb3JBcHAud2ViQ29yZG92YSwgJ3Byb2dyYW0uanNvbicpXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLyoqIEB0eXBlIHtkZXNrdG9wVG1wUGF0aHN9ICoqL1xuICAgICAgICB0aGlzLnBhdGhzLmRlc2t0b3BUbXAgPSB7XG4gICAgICAgICAgICByb290OiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ19fZGVza3RvcCcpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGFzc2lnbkluKHRoaXMucGF0aHMuZGVza3RvcFRtcCwge1xuICAgICAgICAgICAgbW9kdWxlczogam9pbih0aGlzLnBhdGhzLmRlc2t0b3BUbXAucm9vdCwgJ21vZHVsZXMnKSxcbiAgICAgICAgICAgIHNldHRpbmdzOiBqb2luKHRoaXMucGF0aHMuZGVza3RvcFRtcC5yb290LCAnc2V0dGluZ3MuanNvbicpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGF0aHMucGFja2FnZURpciA9ICcuZGVza3RvcC1wYWNrYWdlJztcbiAgICAgICAgdGhpcy5wYXRocy5pbnN0YWxsZXJEaXIgPSAnLmRlc2t0b3AtaW5zdGFsbGVyJztcblxuICAgICAgICAvLyBTY2FmZm9sZFxuICAgICAgICB0aGlzLnBhdGhzLnNjYWZmb2xkID0gam9pbihfX2Rpcm5hbWUsICcuLicsICdzY2FmZm9sZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufCp9XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGlzUHJvZHVjdGlvbkJ1aWxkKCkge1xuICAgICAgICByZXR1cm4gISEoJ3Byb2R1Y3Rpb24nIGluIHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMucHJvZHVjdGlvbik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBkZXNrdG9wUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290TmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJvb3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW1wb3J0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXNzZXRzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2V0dGluZ3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBkZXNrdG9wXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3BsYXNoU2NyZWVuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbG9hZGluZ0dpZlxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckljb1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gbWV0ZW9yQXBwUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290XG4gKiBAcHJvcGVydHkge3N0cmluZ30gcGxhdGZvcm1zXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcmVsZWFzZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHBhY2thZ2VzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmVyc2lvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBnaXRJZ25vcmVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwYWNrYWdlSnNvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNvcmRvdmFCdWlsZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNvcmRvdmFCdWlsZEluZGV4XG4gKiBAcHJvcGVydHkge3N0cmluZ30gY29yZG92YUJ1aWxkUHJvZ3JhbUpzb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB3ZWJDb3Jkb3ZhXG4gKiBAcHJvcGVydHkge3N0cmluZ30gd2ViQ29yZG92YUluZGV4XG4gKiBAcHJvcGVydHkge3N0cmluZ30gd2ViQ29yZG92YVByb2dyYW1Kc29uXG4gKi9cblxuLyoqIEB0eXBlZGVmIHtPYmplY3R9IGVsZWN0cm9uQXBwUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290TmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJvb3RcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcHBSb290XG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBwUm9vdC5jb3Jkb3ZhXG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBwUm9vdC5pbmRleFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGFwcFJvb3QuYXBwXG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBwUm9vdC5tb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZGVza3RvcEFzYXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBleHRyYWN0ZWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBhcHBBc2FyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcHJlbG9hZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGltcG9ydFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGFzc2V0c1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGdpdElnbm9yZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHBhY2thZ2VKc29uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2V0dGluZ3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBkZXNrdG9wXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZGVza3RvcFRtcFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5vZGVNb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbWV0ZW9yQXNhclxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckFwcFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckFwcEluZGV4XG4gKiBAcHJvcGVydHkge3N0cmluZ30gbWV0ZW9yQXBwUHJvZ3JhbUpzb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBza2VsZXRvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHRtcE5vZGVNb2R1bGVzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBkZXNrdG9wVG1wUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290XG4gKiBAcHJvcGVydHkge3N0cmluZ30gbW9kdWxlc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IHNldHRpbmdzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBtZXRlb3JEZXNrdG9wUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290XG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2tlbGV0b25cbiAqL1xuXG4vKiogQHR5cGVkZWYge09iamVjdH0gcGF0aHNcbiAqIEBwcm9wZXJ0eSB7bWV0ZW9yQXBwUGF0aHN9IG1ldGVvckFwcFxuICogQHByb3BlcnR5IHtkZXNrdG9wUGF0aHN9IGRlc2t0b3BcbiAqIEBwcm9wZXJ0eSB7ZWxlY3Ryb25BcHBQYXRoc30gZWxlY3Ryb25BcHBcbiAqIEBwcm9wZXJ0eSB7ZGVza3RvcFRtcFBhdGhzfSBkZXNrdG9wVG1wXG4gKiBAcHJvcGVydHkge21ldGVvckRlc2t0b3BQYXRoc30gbWV0ZW9yRGVza3RvcFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHBhY2thZ2VEaXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzY2FmZm9sZFxuICovXG4iXX0=