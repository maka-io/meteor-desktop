'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
/*
 0.OFF
 1.INFO
 2.WARN
 3.ERROR
 4.TRACE
 5.DEBUG
 6.ALL
 */

var Log = function () {
    function Log(prefix) {
        (0, _classCallCheck3.default)(this, Log);

        this.prefix = prefix;
    }

    (0, _createClass3.default)(Log, [{
        key: 'log',
        value: function log(type, args) {
            console.log.apply(null, [type + '  ' + this.prefix + ': '].concat(Log.slice(args)));
        }
    }, {
        key: 'info',
        value: function info() {
            if (/INFO|ALL/i.test(Log.level())) {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                this.log('INFO', args);
            }
        }
    }, {
        key: 'warn',
        value: function warn() {
            if (/WARN|ALL/i.test(Log.level())) {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                this.log('WARN', args);
            }
        }
    }, {
        key: 'error',
        value: function error() {
            if (/ERROR|ALL/i.test(Log.level())) {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                this.log('ERROR', args);
            }
        }
    }, {
        key: 'debug',
        value: function debug() {
            if (/DEBUG|ALL/i.test(Log.level())) {
                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                this.log('DEBUG', args);
            }
        }
    }, {
        key: 'verbose',
        value: function verbose() {
            if (/VERBOSE|ALL/i.test(Log.level())) {
                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    args[_key5] = arguments[_key5];
                }

                this.log('VERBOSE', args);
            }
        }
    }, {
        key: 'trace',
        value: function trace() {
            if (/TRACE|ALL/i.test(Log.level())) {
                for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    args[_key6] = arguments[_key6];
                }

                this.log('TRACE', args);
            }
        }
    }], [{
        key: 'level',
        value: function level() {
            return process.env.MD_LOG_LEVEL || 'INFO,WARN,ERROR';
        }
    }, {
        key: 'slice',
        value: function slice(args) {
            return Array.prototype.slice.call(args, 0);
        }
    }]);
    return Log;
}();

exports.default = Log;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9sb2cuanMiXSwibmFtZXMiOlsiTG9nIiwicHJlZml4IiwidHlwZSIsImFyZ3MiLCJjb25zb2xlIiwibG9nIiwiYXBwbHkiLCJjb25jYXQiLCJzbGljZSIsInRlc3QiLCJsZXZlbCIsInByb2Nlc3MiLCJlbnYiLCJNRF9MT0dfTEVWRUwiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBOzs7Ozs7Ozs7O0lBVXFCQSxHO0FBQ2pCLGlCQUFZQyxNQUFaLEVBQW9CO0FBQUE7O0FBQ2hCLGFBQUtBLE1BQUwsR0FBY0EsTUFBZDtBQUNIOzs7OzRCQVVHQyxJLEVBQU1DLEksRUFBTTtBQUNaQyxvQkFBUUMsR0FBUixDQUFZQyxLQUFaLENBQWtCLElBQWxCLEVBQXdCLENBQUlKLElBQUosVUFBYSxLQUFLRCxNQUFsQixTQUE4Qk0sTUFBOUIsQ0FBcUNQLElBQUlRLEtBQUosQ0FBVUwsSUFBVixDQUFyQyxDQUF4QjtBQUNIOzs7K0JBRWE7QUFDVixnQkFBSSxZQUFZTSxJQUFaLENBQWlCVCxJQUFJVSxLQUFKLEVBQWpCLENBQUosRUFBbUM7QUFBQSxrREFEL0JQLElBQytCO0FBRC9CQSx3QkFDK0I7QUFBQTs7QUFDL0IscUJBQUtFLEdBQUwsQ0FBUyxNQUFULEVBQWlCRixJQUFqQjtBQUNIO0FBQ0o7OzsrQkFFYTtBQUNWLGdCQUFJLFlBQVlNLElBQVosQ0FBaUJULElBQUlVLEtBQUosRUFBakIsQ0FBSixFQUFtQztBQUFBLG1EQUQvQlAsSUFDK0I7QUFEL0JBLHdCQUMrQjtBQUFBOztBQUMvQixxQkFBS0UsR0FBTCxDQUFTLE1BQVQsRUFBaUJGLElBQWpCO0FBQ0g7QUFDSjs7O2dDQUVjO0FBQ1gsZ0JBQUksYUFBYU0sSUFBYixDQUFrQlQsSUFBSVUsS0FBSixFQUFsQixDQUFKLEVBQW9DO0FBQUEsbURBRC9CUCxJQUMrQjtBQUQvQkEsd0JBQytCO0FBQUE7O0FBQ2hDLHFCQUFLRSxHQUFMLENBQVMsT0FBVCxFQUFrQkYsSUFBbEI7QUFDSDtBQUNKOzs7Z0NBRWM7QUFDWCxnQkFBSSxhQUFhTSxJQUFiLENBQWtCVCxJQUFJVSxLQUFKLEVBQWxCLENBQUosRUFBb0M7QUFBQSxtREFEL0JQLElBQytCO0FBRC9CQSx3QkFDK0I7QUFBQTs7QUFDaEMscUJBQUtFLEdBQUwsQ0FBUyxPQUFULEVBQWtCRixJQUFsQjtBQUNIO0FBQ0o7OztrQ0FFZ0I7QUFDYixnQkFBSSxlQUFlTSxJQUFmLENBQW9CVCxJQUFJVSxLQUFKLEVBQXBCLENBQUosRUFBc0M7QUFBQSxtREFEL0JQLElBQytCO0FBRC9CQSx3QkFDK0I7QUFBQTs7QUFDbEMscUJBQUtFLEdBQUwsQ0FBUyxTQUFULEVBQW9CRixJQUFwQjtBQUNIO0FBQ0o7OztnQ0FFYztBQUNYLGdCQUFJLGFBQWFNLElBQWIsQ0FBa0JULElBQUlVLEtBQUosRUFBbEIsQ0FBSixFQUFvQztBQUFBLG1EQUQvQlAsSUFDK0I7QUFEL0JBLHdCQUMrQjtBQUFBOztBQUNoQyxxQkFBS0UsR0FBTCxDQUFTLE9BQVQsRUFBa0JGLElBQWxCO0FBQ0g7QUFDSjs7O2dDQTlDYztBQUNYLG1CQUFPUSxRQUFRQyxHQUFSLENBQVlDLFlBQVosSUFBNEIsaUJBQW5DO0FBQ0g7Ozs4QkFFWVYsSSxFQUFNO0FBQ2YsbUJBQU9XLE1BQU1DLFNBQU4sQ0FBZ0JQLEtBQWhCLENBQXNCUSxJQUF0QixDQUEyQmIsSUFBM0IsRUFBaUMsQ0FBakMsQ0FBUDtBQUNIOzs7OztrQkFYZ0JILEciLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuLypcbiAwLk9GRlxuIDEuSU5GT1xuIDIuV0FSTlxuIDMuRVJST1JcbiA0LlRSQUNFXG4gNS5ERUJVR1xuIDYuQUxMXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nIHtcbiAgICBjb25zdHJ1Y3RvcihwcmVmaXgpIHtcbiAgICAgICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgfVxuXG4gICAgc3RhdGljIGxldmVsKCkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTURfTE9HX0xFVkVMIHx8ICdJTkZPLFdBUk4sRVJST1InO1xuICAgIH1cblxuICAgIHN0YXRpYyBzbGljZShhcmdzKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCAwKTtcbiAgICB9XG5cbiAgICBsb2codHlwZSwgYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShudWxsLCBbYCR7dHlwZX0gICR7dGhpcy5wcmVmaXh9OiBgXS5jb25jYXQoTG9nLnNsaWNlKGFyZ3MpKSk7XG4gICAgfVxuXG4gICAgaW5mbyguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvSU5GT3xBTEwvaS50ZXN0KExvZy5sZXZlbCgpKSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ0lORk8nLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdhcm4oLi4uYXJncykge1xuICAgICAgICBpZiAoL1dBUk58QUxML2kudGVzdChMb2cubGV2ZWwoKSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdXQVJOJywgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlcnJvciguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvRVJST1J8QUxML2kudGVzdChMb2cubGV2ZWwoKSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdFUlJPUicsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVidWcoLi4uYXJncykge1xuICAgICAgICBpZiAoL0RFQlVHfEFMTC9pLnRlc3QoTG9nLmxldmVsKCkpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygnREVCVUcnLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZlcmJvc2UoLi4uYXJncykge1xuICAgICAgICBpZiAoL1ZFUkJPU0V8QUxML2kudGVzdChMb2cubGV2ZWwoKSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdWRVJCT1NFJywgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmFjZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvVFJBQ0V8QUxML2kudGVzdChMb2cubGV2ZWwoKSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdUUkFDRScsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19