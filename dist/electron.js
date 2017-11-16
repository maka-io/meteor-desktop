'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Simple Electron runner. Runs the project with the bin provided by the 'electron' package.
 * @class
 */
var Electron = function () {
    function Electron($) {
        (0, _classCallCheck3.default)(this, Electron);

        this.log = new _log2.default('electron');
        this.$ = $;
    }

    (0, _createClass3.default)(Electron, [{
        key: 'run',
        value: function run() {
            // Until: https://github.com/electron-userland/electron-prebuilt/pull/118
            var env = process.env;
            env.ELECTRON_ENV = 'development';

            var child = (0, _crossSpawn2.default)(_electron2.default, ['.'], {
                cwd: this.$.env.paths.electronApp.root,
                env: env
            });

            // TODO: check if we can configure piping in spawn options
            child.stdout.on('data', function (chunk) {
                process.stdout.write(chunk);
            });
            child.stderr.on('data', function (chunk) {
                process.stderr.write(chunk);
            });
        }
    }]);
    return Electron;
}();

exports.default = Electron;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbi5qcyJdLCJuYW1lcyI6WyJFbGVjdHJvbiIsIiQiLCJsb2ciLCJlbnYiLCJwcm9jZXNzIiwiRUxFQ1RST05fRU5WIiwiY2hpbGQiLCJjd2QiLCJwYXRocyIsImVsZWN0cm9uQXBwIiwicm9vdCIsInN0ZG91dCIsIm9uIiwiY2h1bmsiLCJ3cml0ZSIsInN0ZGVyciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBOzs7O0lBSXFCQSxRO0FBRWpCLHNCQUFZQyxDQUFaLEVBQWU7QUFBQTs7QUFDWCxhQUFLQyxHQUFMLEdBQVcsa0JBQVEsVUFBUixDQUFYO0FBQ0EsYUFBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0g7Ozs7OEJBRUs7QUFDRjtBQUNBLGdCQUFNRSxNQUFNQyxRQUFRRCxHQUFwQjtBQUNBQSxnQkFBSUUsWUFBSixHQUFtQixhQUFuQjs7QUFFQSxnQkFBTUMsUUFBUSw4Q0FBc0IsQ0FBQyxHQUFELENBQXRCLEVBQTZCO0FBQ3ZDQyxxQkFBSyxLQUFLTixDQUFMLENBQU9FLEdBQVAsQ0FBV0ssS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJDLElBREs7QUFFdkNQO0FBRnVDLGFBQTdCLENBQWQ7O0FBS0E7QUFDQUcsa0JBQU1LLE1BQU4sQ0FBYUMsRUFBYixDQUFnQixNQUFoQixFQUF3QixVQUFDQyxLQUFELEVBQVc7QUFDL0JULHdCQUFRTyxNQUFSLENBQWVHLEtBQWYsQ0FBcUJELEtBQXJCO0FBQ0gsYUFGRDtBQUdBUCxrQkFBTVMsTUFBTixDQUFhSCxFQUFiLENBQWdCLE1BQWhCLEVBQXdCLFVBQUNDLEtBQUQsRUFBVztBQUMvQlQsd0JBQVFXLE1BQVIsQ0FBZUQsS0FBZixDQUFxQkQsS0FBckI7QUFDSCxhQUZEO0FBR0g7Ozs7O2tCQXhCZ0JiLFEiLCJmaWxlIjoiZWxlY3Ryb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuaW1wb3J0IHBhdGhUb0VsZWN0cm9uIGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5cbi8qKlxuICogU2ltcGxlIEVsZWN0cm9uIHJ1bm5lci4gUnVucyB0aGUgcHJvamVjdCB3aXRoIHRoZSBiaW4gcHJvdmlkZWQgYnkgdGhlICdlbGVjdHJvbicgcGFja2FnZS5cbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVjdHJvbiB7XG5cbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZWxlY3Ryb24nKTtcbiAgICAgICAgdGhpcy4kID0gJDtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIC8vIFVudGlsOiBodHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24tdXNlcmxhbmQvZWxlY3Ryb24tcHJlYnVpbHQvcHVsbC8xMThcbiAgICAgICAgY29uc3QgZW52ID0gcHJvY2Vzcy5lbnY7XG4gICAgICAgIGVudi5FTEVDVFJPTl9FTlYgPSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24ocGF0aFRvRWxlY3Ryb24sIFsnLiddLCB7XG4gICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCxcbiAgICAgICAgICAgIGVudlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiB3ZSBjYW4gY29uZmlndXJlIHBpcGluZyBpbiBzcGF3biBvcHRpb25zXG4gICAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoY2h1bmspO1xuICAgICAgICB9KTtcbiAgICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShjaHVuayk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==