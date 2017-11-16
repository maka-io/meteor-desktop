'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _log3 = require('./log');

var _log4 = _interopRequireDefault(_log3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utility class designed for managing Meteor packages.
 *
 * @property {MeteorDesktop} $
 * @class
 */
var MeteorManager = function () {
    /**
     * @param {MeteorDesktop} $ - context
     * @constructor
     */
    function MeteorManager($) {
        (0, _classCallCheck3.default)(this, MeteorManager);

        this.log = new _log4.default('meteorManager');
        this.$ = $;
    }

    /**
     * Looks for specified packages in .meteor/packages. In other words checks if the project has
     * specified packages added.
     * @param {Array} packages
     * @returns {boolean}
     */


    (0, _createClass3.default)(MeteorManager, [{
        key: 'checkPackages',
        value: function checkPackages(packages) {
            var usedPackages = _fs2.default.readFileSync(this.$.env.paths.meteorApp.packages, 'UTF-8').split('\n').filter(function (line) {
                return !line.trim().startsWith('#');
            });
            return !packages.some(function (packageToFind) {
                return !usedPackages.some(function (meteorPackage) {
                    return ~meteorPackage.indexOf(packageToFind);
                });
            });
        }

        /**
         * Looks for specified packages in .meteor/packages. In other words checks if the project has
         * specified packages added.
         * @param {Array} packages
         * @returns {boolean}
         */

    }, {
        key: 'checkPackagesVersion',
        value: function checkPackagesVersion(packages) {
            var usedPackages = _fs2.default.readFileSync(this.$.env.paths.meteorApp.versions, 'UTF-8').split('\n');
            return !packages.some(function (packageToFind) {
                return !usedPackages.some(function (meteorPackage) {
                    return meteorPackage === packageToFind;
                });
            });
        }

        /**
         * Ensures certain packages are added to meteor project and in correct version.
         * @param {Array} packages
         * @param {Array} packagesWithVersion
         * @param {string} who - name of the entity that requests presence of thos packages (can be the
         *                       integration itself or a plugin)
         * @returns {Promise.<void>}
         */

    }, {
        key: 'ensurePackages',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(packages, packagesWithVersion, who) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.checkPackages(packages)) {
                                    _context.next = 10;
                                    break;
                                }

                                this.log.warn(who + ' requires some packages that are not added to project, will try to add them now');
                                _context.prev = 2;
                                _context.next = 5;
                                return this.addPackages(packages, packagesWithVersion);

                            case 5:
                                _context.next = 10;
                                break;

                            case 7:
                                _context.prev = 7;
                                _context.t0 = _context['catch'](2);
                                throw new Error(_context.t0);

                            case 10:
                                if (this.checkPackagesVersion(packagesWithVersion)) {
                                    _context.next = 20;
                                    break;
                                }

                                this.log.warn(who + ' required packages version is different, fixing it');
                                _context.prev = 12;
                                _context.next = 15;
                                return this.addPackages(packages, packagesWithVersion);

                            case 15:
                                _context.next = 20;
                                break;

                            case 17:
                                _context.prev = 17;
                                _context.t1 = _context['catch'](12);
                                throw new Error(_context.t1);

                            case 20:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[2, 7], [12, 17]]);
            }));

            function ensurePackages(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return ensurePackages;
        }()

        /**
         * Removes packages from the meteor app.
         * @param {Array} packages            - array with names of the packages to remove
         */

    }, {
        key: 'deletePackages',
        value: function deletePackages(packages) {
            var _log,
                _this = this;

            (_log = this.log).warn.apply(_log, ['removing packages from meteor project'].concat((0, _toConsumableArray3.default)(packages)));
            return new _promise2.default(function (resolve, reject) {
                (0, _crossSpawn2.default)('meteor', ['remove'].concat(packages), {
                    cwd: _this.$.env.paths.meteorApp.root,
                    stdio: ['pipe', 'pipe', process.stderr],
                    env: (0, _assign2.default)({ METEOR_PRETTY_OUTPUT: 0, METEOR_NO_RELEASE_CHECK: 1 }, process.env)
                }).on('exit', function (code) {
                    if (code !== 0 || _this.checkPackages(packages)) {
                        reject('removeing packages failed');
                    } else {
                        resolve();
                    }
                });
            });
        }

        /**
         * Adds packages to the meteor app.
         * @param {Array} packages            - array with names of the packages to add
         * @param {Array} packagesWithVersion - array with names and versions of the packages to add
         */

    }, {
        key: 'addPackages',
        value: function addPackages(packages, packagesWithVersion) {
            var _log2,
                _this2 = this;

            (_log2 = this.log).info.apply(_log2, ['adding packages to meteor project'].concat((0, _toConsumableArray3.default)(packagesWithVersion)));
            return new _promise2.default(function (resolve, reject) {
                (0, _crossSpawn2.default)('meteor', ['add'].concat(packagesWithVersion.map(function (packageName) {
                    return packageName.replace('@', '@=');
                })), {
                    cwd: _this2.$.env.paths.meteorApp.root,
                    stdio: ['pipe', 'pipe', process.stderr],
                    env: (0, _assign2.default)({ METEOR_PRETTY_OUTPUT: 0, METEOR_NO_RELEASE_CHECK: 1 }, process.env)
                }).on('exit', function (code) {
                    if (code !== 0 || !_this2.checkPackages(packages)) {
                        reject('adding packages failed');
                    } else {
                        resolve();
                    }
                });
            });
        }
    }]);
    return MeteorManager;
}();

exports.default = MeteorManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9tZXRlb3JNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIk1ldGVvck1hbmFnZXIiLCIkIiwibG9nIiwicGFja2FnZXMiLCJ1c2VkUGFja2FnZXMiLCJyZWFkRmlsZVN5bmMiLCJlbnYiLCJwYXRocyIsIm1ldGVvckFwcCIsInNwbGl0IiwiZmlsdGVyIiwibGluZSIsInRyaW0iLCJzdGFydHNXaXRoIiwic29tZSIsIm1ldGVvclBhY2thZ2UiLCJpbmRleE9mIiwicGFja2FnZVRvRmluZCIsInZlcnNpb25zIiwicGFja2FnZXNXaXRoVmVyc2lvbiIsIndobyIsImNoZWNrUGFja2FnZXMiLCJ3YXJuIiwiYWRkUGFja2FnZXMiLCJFcnJvciIsImNoZWNrUGFja2FnZXNWZXJzaW9uIiwicmVzb2x2ZSIsInJlamVjdCIsImNvbmNhdCIsImN3ZCIsInJvb3QiLCJzdGRpbyIsInByb2Nlc3MiLCJzdGRlcnIiLCJNRVRFT1JfUFJFVFRZX09VVFBVVCIsIk1FVEVPUl9OT19SRUxFQVNFX0NIRUNLIiwib24iLCJjb2RlIiwiaW5mbyIsIm1hcCIsInBhY2thZ2VOYW1lIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBRUE7Ozs7OztJQU1xQkEsYTtBQUNqQjs7OztBQUlBLDJCQUFZQyxDQUFaLEVBQWU7QUFBQTs7QUFDWCxhQUFLQyxHQUFMLEdBQVcsa0JBQVEsZUFBUixDQUFYO0FBQ0EsYUFBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7c0NBTWNFLFEsRUFBVTtBQUNwQixnQkFBTUMsZUFBZSxhQUNoQkMsWUFEZ0IsQ0FDSCxLQUFLSixDQUFMLENBQU9LLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkJMLFFBRHhCLEVBQ2tDLE9BRGxDLEVBRWhCTSxLQUZnQixDQUVWLElBRlUsRUFHaEJDLE1BSGdCLENBR1Q7QUFBQSx1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ZjtBQUFBLGlCQUF4QixDQURKLENBRkosRUFJSTtBQUNJWix5QkFBSyxPQUFLNUIsQ0FBTCxDQUFPSyxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCc0IsSUFEcEM7QUFFSUMsMkJBQU8sQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQkMsUUFBUUMsTUFBekIsQ0FGWDtBQUdJM0IseUJBQUssc0JBQ0QsRUFBRTRCLHNCQUFzQixDQUF4QixFQUEyQkMseUJBQXlCLENBQXBELEVBREMsRUFDd0RILFFBQVExQixHQURoRTtBQUhULGlCQUpKLEVBVUU4QixFQVZGLENBVUssTUFWTCxFQVVhLFVBQUNDLElBQUQsRUFBVTtBQUNuQix3QkFBSUEsU0FBUyxDQUFULElBQWMsQ0FBQyxPQUFLaEIsYUFBTCxDQUFtQmxCLFFBQW5CLENBQW5CLEVBQWlEO0FBQzdDd0IsK0JBQU8sd0JBQVA7QUFDSCxxQkFGRCxNQUVPO0FBQ0hEO0FBQ0g7QUFDSixpQkFoQkQ7QUFpQkgsYUFsQk0sQ0FBUDtBQW1CSDs7Ozs7a0JBdEhnQjFCLGEiLCJmaWxlIjoibWV0ZW9yTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgc3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuLyoqXG4gKiBVdGlsaXR5IGNsYXNzIGRlc2lnbmVkIGZvciBtYW5hZ2luZyBNZXRlb3IgcGFja2FnZXMuXG4gKlxuICogQHByb3BlcnR5IHtNZXRlb3JEZXNrdG9wfSAkXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWV0ZW9yTWFuYWdlciB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNZXRlb3JEZXNrdG9wfSAkIC0gY29udGV4dFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQpIHtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdtZXRlb3JNYW5hZ2VyJyk7XG4gICAgICAgIHRoaXMuJCA9ICQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9va3MgZm9yIHNwZWNpZmllZCBwYWNrYWdlcyBpbiAubWV0ZW9yL3BhY2thZ2VzLiBJbiBvdGhlciB3b3JkcyBjaGVja3MgaWYgdGhlIHByb2plY3QgaGFzXG4gICAgICogc3BlY2lmaWVkIHBhY2thZ2VzIGFkZGVkLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2hlY2tQYWNrYWdlcyhwYWNrYWdlcykge1xuICAgICAgICBjb25zdCB1c2VkUGFja2FnZXMgPSBmc1xuICAgICAgICAgICAgLnJlYWRGaWxlU3luYyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5wYWNrYWdlcywgJ1VURi04JylcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIC5maWx0ZXIobGluZSA9PiAhbGluZS50cmltKCkuc3RhcnRzV2l0aCgnIycpKTtcbiAgICAgICAgcmV0dXJuICFwYWNrYWdlcy5zb21lKFxuICAgICAgICAgICAgcGFja2FnZVRvRmluZCA9PlxuICAgICAgICAgICAgICAgICF1c2VkUGFja2FnZXMuc29tZShtZXRlb3JQYWNrYWdlID0+IH5tZXRlb3JQYWNrYWdlLmluZGV4T2YocGFja2FnZVRvRmluZCkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9va3MgZm9yIHNwZWNpZmllZCBwYWNrYWdlcyBpbiAubWV0ZW9yL3BhY2thZ2VzLiBJbiBvdGhlciB3b3JkcyBjaGVja3MgaWYgdGhlIHByb2plY3QgaGFzXG4gICAgICogc3BlY2lmaWVkIHBhY2thZ2VzIGFkZGVkLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2hlY2tQYWNrYWdlc1ZlcnNpb24ocGFja2FnZXMpIHtcbiAgICAgICAgY29uc3QgdXNlZFBhY2thZ2VzID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnZlcnNpb25zLCAnVVRGLTgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIHJldHVybiAhcGFja2FnZXMuc29tZShcbiAgICAgICAgICAgIHBhY2thZ2VUb0ZpbmQgPT4gIXVzZWRQYWNrYWdlcy5zb21lKG1ldGVvclBhY2thZ2UgPT4gbWV0ZW9yUGFja2FnZSA9PT0gcGFja2FnZVRvRmluZClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmVzIGNlcnRhaW4gcGFja2FnZXMgYXJlIGFkZGVkIHRvIG1ldGVvciBwcm9qZWN0IGFuZCBpbiBjb3JyZWN0IHZlcnNpb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gcGFja2FnZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYWNrYWdlc1dpdGhWZXJzaW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdobyAtIG5hbWUgb2YgdGhlIGVudGl0eSB0aGF0IHJlcXVlc3RzIHByZXNlbmNlIG9mIHRob3MgcGFja2FnZXMgKGNhbiBiZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgaW50ZWdyYXRpb24gaXRzZWxmIG9yIGEgcGx1Z2luKVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cbiAgICAgKi9cbiAgICBhc3luYyBlbnN1cmVQYWNrYWdlcyhwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbiwgd2hvKSB7XG4gICAgICAgIGlmICghdGhpcy5jaGVja1BhY2thZ2VzKHBhY2thZ2VzKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cud2FybihgJHt3aG99IHJlcXVpcmVzIHNvbWUgcGFja2FnZXMgdGhhdCBhcmUgbm90IGFkZGVkIHRvIHByb2plY3QsIHdpbGwgdHJ5IHRvIGFkZCB0aGVtIG5vd2ApO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZFBhY2thZ2VzKHBhY2thZ2VzLCBwYWNrYWdlc1dpdGhWZXJzaW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrUGFja2FnZXNWZXJzaW9uKHBhY2thZ2VzV2l0aFZlcnNpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy53YXJuKGAke3dob30gcmVxdWlyZWQgcGFja2FnZXMgdmVyc2lvbiBpcyBkaWZmZXJlbnQsIGZpeGluZyBpdGApO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZFBhY2thZ2VzKHBhY2thZ2VzLCBwYWNrYWdlc1dpdGhWZXJzaW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHBhY2thZ2VzIGZyb20gdGhlIG1ldGVvciBhcHAuXG4gICAgICogQHBhcmFtIHtBcnJheX0gcGFja2FnZXMgICAgICAgICAgICAtIGFycmF5IHdpdGggbmFtZXMgb2YgdGhlIHBhY2thZ2VzIHRvIHJlbW92ZVxuICAgICAqL1xuICAgIGRlbGV0ZVBhY2thZ2VzKHBhY2thZ2VzKSB7XG4gICAgICAgIHRoaXMubG9nLndhcm4oJ3JlbW92aW5nIHBhY2thZ2VzIGZyb20gbWV0ZW9yIHByb2plY3QnLCAuLi5wYWNrYWdlcyk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzcGF3bihcbiAgICAgICAgICAgICAgICAnbWV0ZW9yJyxcbiAgICAgICAgICAgICAgICBbJ3JlbW92ZSddLmNvbmNhdChwYWNrYWdlcyksIHtcbiAgICAgICAgICAgICAgICAgICAgY3dkOiB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5yb290LFxuICAgICAgICAgICAgICAgICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCBwcm9jZXNzLnN0ZGVycl0sXG4gICAgICAgICAgICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgTUVURU9SX1BSRVRUWV9PVVRQVVQ6IDAsIE1FVEVPUl9OT19SRUxFQVNFX0NIRUNLOiAxIH0sIHByb2Nlc3MuZW52KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlICE9PSAwIHx8IHRoaXMuY2hlY2tQYWNrYWdlcyhwYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdyZW1vdmVpbmcgcGFja2FnZXMgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHBhY2thZ2VzIHRvIHRoZSBtZXRlb3IgYXBwLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzICAgICAgICAgICAgLSBhcnJheSB3aXRoIG5hbWVzIG9mIHRoZSBwYWNrYWdlcyB0byBhZGRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYWNrYWdlc1dpdGhWZXJzaW9uIC0gYXJyYXkgd2l0aCBuYW1lcyBhbmQgdmVyc2lvbnMgb2YgdGhlIHBhY2thZ2VzIHRvIGFkZFxuICAgICAqL1xuICAgIGFkZFBhY2thZ2VzKHBhY2thZ2VzLCBwYWNrYWdlc1dpdGhWZXJzaW9uKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2FkZGluZyBwYWNrYWdlcyB0byBtZXRlb3IgcHJvamVjdCcsIC4uLnBhY2thZ2VzV2l0aFZlcnNpb24pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc3Bhd24oXG4gICAgICAgICAgICAgICAgJ21ldGVvcicsXG4gICAgICAgICAgICAgICAgWydhZGQnXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIHBhY2thZ2VzV2l0aFZlcnNpb24ubWFwKHBhY2thZ2VOYW1lID0+IHBhY2thZ2VOYW1lLnJlcGxhY2UoJ0AnLCAnQD0nKSkpLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY3dkOiB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5yb290LFxuICAgICAgICAgICAgICAgICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCBwcm9jZXNzLnN0ZGVycl0sXG4gICAgICAgICAgICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgTUVURU9SX1BSRVRUWV9PVVRQVVQ6IDAsIE1FVEVPUl9OT19SRUxFQVNFX0NIRUNLOiAxIH0sIHByb2Nlc3MuZW52KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlICE9PSAwIHx8ICF0aGlzLmNoZWNrUGFja2FnZXMocGFja2FnZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnYWRkaW5nIHBhY2thZ2VzIGZhaWxlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19