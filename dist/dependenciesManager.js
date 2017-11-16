'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utility class designed for merging dependencies list with simple validation and duplicate
 * detection.
 *
 * @class
 */
var DependenciesManager = function () {

    /**
     * @param {MeteorDesktop} $                   - context
     * @param {Object}        defaultDependencies - core dependencies list
     * @constructor
     */
    function DependenciesManager($, defaultDependencies) {
        (0, _classCallCheck3.default)(this, DependenciesManager);

        this.log = new _log2.default('dependenciesManager');
        this.$ = $;
        this.dependencies = defaultDependencies;

        // Regexes for matching certain types of dependencies version.
        // https://docs.npmjs.com/files/package.json#dependencies
        this.regexes = {
            local: /^(\.\.\/|~\/|\.\/|\/)/,
            git: /^git(\+(ssh|http)s?)?/,
            github: /^\w+-?\w+(?!-)\//,
            http: /^https?.+tar\.gz/,
            file: /^file:/
        };

        // Check for commit hashes.
        var gitCheck = {
            type: 'regex',
            regex: /#[a-f0-9]{7,40}/,
            test: 'match',
            message: 'git or github link must have a commit hash'
        };

        // Check for displaying warnings when npm package from local path is used.
        var localCheck = {
            onceName: 'localCheck',
            type: 'warning',
            message: 'using dependencies from local paths is permitted' + ' but dangerous - read more in README.md'
        };

        this.checks = {
            local: localCheck,
            file: localCheck,
            git: gitCheck,
            github: gitCheck,
            version: {
                type: 'regex',
                // Matches all the semver ranges operators, empty strings and `*`.
                regex: /[|><= ~-]|\.x|$^|^\*$/,
                test: 'do not match',
                message: 'semver ranges are forbidden, please specify exact version'
            }
        };
    }

    /**
     * Just a public getter.
     * @returns {Object}
     */


    (0, _createClass3.default)(DependenciesManager, [{
        key: 'getDependencies',
        value: function getDependencies() {
            return this.dependencies;
        }

        /**
         * Merges dependencies into one list.
         *
         * @param {string} from         - describes where the dependencies were set
         * @param {Object} dependencies - dependencies list
         */

    }, {
        key: 'mergeDependencies',
        value: function mergeDependencies(from, dependencies) {
            if (this.validateDependenciesVersions(from, dependencies)) {
                this.detectDuplicatedDependencies(from, dependencies);
                (0, _lodash.assignIn)(this.dependencies, dependencies);
            }
        }

        /**
         * Detects dependency version type.
         * @param {string} version - version string of the dependency
         * @return {string}
         */

    }, {
        key: 'detectDependencyVersionType',
        value: function detectDependencyVersionType(version) {
            var _this = this;

            var type = (0, _keys2.default)(this.regexes).find(function (dependencyType) {
                return _this.regexes[dependencyType].test(version);
            });
            return type || 'version';
        }

        /**
         * Validates semver and detect ranges.
         *
         * @param {string} from         - describes where the dependencies were set
         * @param {Object} dependencies - dependencies list
         */

    }, {
        key: 'validateDependenciesVersions',
        value: function validateDependenciesVersions(from, dependencies) {
            var _this2 = this;

            var warningsShown = {};
            (0, _lodash.forEach)(dependencies, function (version, name) {
                var type = _this2.detectDependencyVersionType(version);
                if (_this2.checks[type]) {
                    var check = _this2.checks[type];
                    if (check.type === 'regex') {
                        var checkResult = check.test === 'match' ? _this2.checks[type].regex.test(version) : !_this2.checks[type].regex.test(version);
                        if (!checkResult) {
                            throw new Error('dependency ' + name + ':' + version + ' from ' + from + ' failed version ' + ('check with message: ' + _this2.checks[type].message));
                        }
                    }
                    if (check.type === 'warning' && !warningsShown[check.onceName]) {
                        warningsShown[check.onceName] = true;
                        _this2.log.warn('dependency ' + name + ':' + version + ' from ' + from + ' caused a' + (' warning: ' + check.message));
                    }
                }
            });
            return true;
        }

        /**
         * Detects duplicates.
         *
         * @param {string} from         - describes where the dependencies were set
         * @param {Object} dependencies - dependencies list
         */

    }, {
        key: 'detectDuplicatedDependencies',
        value: function detectDuplicatedDependencies(from, dependencies) {
            var _this3 = this;

            var duplicates = (0, _lodash.intersection)((0, _keys2.default)(dependencies), (0, _keys2.default)(this.dependencies));
            if (duplicates.length > 0) {
                duplicates.forEach(function (name) {
                    if (dependencies[name] !== _this3.dependencies[name]) {
                        throw new Error('While processing dependencies from ' + from + ', a dependency ' + (name + ': ' + dependencies[name] + ' was found to be conflicting with a ') + ('dependency (' + _this3.dependencies[name] + ') that was already declared in ') + 'other module or it is used in core of the electron app.');
                    }
                });
            }
        }
    }]);
    return DependenciesManager;
}();

exports.default = DependenciesManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9kZXBlbmRlbmNpZXNNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIkRlcGVuZGVuY2llc01hbmFnZXIiLCIkIiwiZGVmYXVsdERlcGVuZGVuY2llcyIsImxvZyIsImRlcGVuZGVuY2llcyIsInJlZ2V4ZXMiLCJsb2NhbCIsImdpdCIsImdpdGh1YiIsImh0dHAiLCJmaWxlIiwiZ2l0Q2hlY2siLCJ0eXBlIiwicmVnZXgiLCJ0ZXN0IiwibWVzc2FnZSIsImxvY2FsQ2hlY2siLCJvbmNlTmFtZSIsImNoZWNrcyIsInZlcnNpb24iLCJmcm9tIiwidmFsaWRhdGVEZXBlbmRlbmNpZXNWZXJzaW9ucyIsImRldGVjdER1cGxpY2F0ZWREZXBlbmRlbmNpZXMiLCJmaW5kIiwiZGVwZW5kZW5jeVR5cGUiLCJ3YXJuaW5nc1Nob3duIiwibmFtZSIsImRldGVjdERlcGVuZGVuY3lWZXJzaW9uVHlwZSIsImNoZWNrIiwiY2hlY2tSZXN1bHQiLCJFcnJvciIsIndhcm4iLCJkdXBsaWNhdGVzIiwibGVuZ3RoIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7SUFNcUJBLG1COztBQUVqQjs7Ozs7QUFLQSxpQ0FBWUMsQ0FBWixFQUFlQyxtQkFBZixFQUFvQztBQUFBOztBQUNoQyxhQUFLQyxHQUFMLEdBQVcsa0JBQVEscUJBQVIsQ0FBWDtBQUNBLGFBQUtGLENBQUwsR0FBU0EsQ0FBVDtBQUNBLGFBQUtHLFlBQUwsR0FBb0JGLG1CQUFwQjs7QUFFQTtBQUNBO0FBQ0EsYUFBS0csT0FBTCxHQUFlO0FBQ1hDLG1CQUFPLHVCQURJO0FBRVhDLGlCQUFLLHVCQUZNO0FBR1hDLG9CQUFRLGtCQUhHO0FBSVhDLGtCQUFNLGtCQUpLO0FBS1hDLGtCQUFNO0FBTEssU0FBZjs7QUFRQTtBQUNBLFlBQU1DLFdBQVc7QUFDYkMsa0JBQU0sT0FETztBQUViQyxtQkFBTyxpQkFGTTtBQUdiQyxrQkFBTSxPQUhPO0FB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QTJCO0FBQ3ZCRCwyQkFBV0UsT0FBWCxDQUFtQixVQUFDUixJQUFELEVBQVU7QUFDekIsd0JBQUl0QixhQUFhc0IsSUFBYixNQUF1QixPQUFLdEIsWUFBTCxDQUFrQnNCLElBQWxCLENBQTNCLEVBQW9EO0FBQ2hELDhCQUFNLElBQUlJLEtBQUosQ0FBVSx3Q0FBc0NWLElBQXRDLHdCQUNUTSxJQURTLFVBQ0F0QixhQUFhc0IsSUFBYixDQURBLCtEQUVHLE9BQUt0QixZQUFMLENBQWtCc0IsSUFBbEIsQ0FGSCx3Q0FHWix5REFIRSxDQUFOO0FBSUg7QUFDSixpQkFQRDtBQVFIO0FBQ0o7Ozs7O2tCQXRJZ0IxQixtQiIsImZpbGUiOiJkZXBlbmRlbmNpZXNNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZm9yRWFjaCwgYXNzaWduSW4sIGludGVyc2VjdGlvbiB9IGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCBMb2cgZnJvbSAnLi9sb2cnO1xuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgZGVzaWduZWQgZm9yIG1lcmdpbmcgZGVwZW5kZW5jaWVzIGxpc3Qgd2l0aCBzaW1wbGUgdmFsaWRhdGlvbiBhbmQgZHVwbGljYXRlXG4gKiBkZXRlY3Rpb24uXG4gKlxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlcGVuZGVuY2llc01hbmFnZXIge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNZXRlb3JEZXNrdG9wfSAkICAgICAgICAgICAgICAgICAgIC0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgICAgZGVmYXVsdERlcGVuZGVuY2llcyAtIGNvcmUgZGVwZW5kZW5jaWVzIGxpc3RcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkLCBkZWZhdWx0RGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZGVwZW5kZW5jaWVzTWFuYWdlcicpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgICAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlZmF1bHREZXBlbmRlbmNpZXM7XG5cbiAgICAgICAgLy8gUmVnZXhlcyBmb3IgbWF0Y2hpbmcgY2VydGFpbiB0eXBlcyBvZiBkZXBlbmRlbmNpZXMgdmVyc2lvbi5cbiAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLm5wbWpzLmNvbS9maWxlcy9wYWNrYWdlLmpzb24jZGVwZW5kZW5jaWVzXG4gICAgICAgIHRoaXMucmVnZXhlcyA9IHtcbiAgICAgICAgICAgIGxvY2FsOiAvXihcXC5cXC5cXC98flxcL3xcXC5cXC98XFwvKS8sXG4gICAgICAgICAgICBnaXQ6IC9eZ2l0KFxcKyhzc2h8aHR0cClzPyk/LyxcbiAgICAgICAgICAgIGdpdGh1YjogL15cXHcrLT9cXHcrKD8hLSlcXC8vLFxuICAgICAgICAgICAgaHR0cDogL15odHRwcz8uK3RhclxcLmd6LyxcbiAgICAgICAgICAgIGZpbGU6IC9eZmlsZTovXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbW1pdCBoYXNoZXMuXG4gICAgICAgIGNvbnN0IGdpdENoZWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ3JlZ2V4JyxcbiAgICAgICAgICAgIHJlZ2V4OiAvI1thLWYwLTldezcsNDB9LyxcbiAgICAgICAgICAgIHRlc3Q6ICdtYXRjaCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnZ2l0IG9yIGdpdGh1YiBsaW5rIG11c3QgaGF2ZSBhIGNvbW1pdCBoYXNoJ1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrIGZvciBkaXNwbGF5aW5nIHdhcm5pbmdzIHdoZW4gbnBtIHBhY2thZ2UgZnJvbSBsb2NhbCBwYXRoIGlzIHVzZWQuXG4gICAgICAgIGNvbnN0IGxvY2FsQ2hlY2sgPSB7XG4gICAgICAgICAgICBvbmNlTmFtZTogJ2xvY2FsQ2hlY2snLFxuICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ3VzaW5nIGRlcGVuZGVuY2llcyBmcm9tIGxvY2FsIHBhdGhzIGlzIHBlcm1pdHRlZCcgK1xuICAgICAgICAgICAgJyBidXQgZGFuZ2Vyb3VzIC0gcmVhZCBtb3JlIGluIFJFQURNRS5tZCdcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNoZWNrcyA9IHtcbiAgICAgICAgICAgIGxvY2FsOiBsb2NhbENoZWNrLFxuICAgICAgICAgICAgZmlsZTogbG9jYWxDaGVjayxcbiAgICAgICAgICAgIGdpdDogZ2l0Q2hlY2ssXG4gICAgICAgICAgICBnaXRodWI6IGdpdENoZWNrLFxuICAgICAgICAgICAgdmVyc2lvbjoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZWdleCcsXG4gICAgICAgICAgICAgICAgLy8gTWF0Y2hlcyBhbGwgdGhlIHNlbXZlciByYW5nZXMgb3BlcmF0b3JzLCBlbXB0eSBzdHJpbmdzIGFuZCBgKmAuXG4gICAgICAgICAgICAgICAgcmVnZXg6IC9bfD48PSB+LV18XFwueHwkXnxeXFwqJC8sXG4gICAgICAgICAgICAgICAgdGVzdDogJ2RvIG5vdCBtYXRjaCcsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3NlbXZlciByYW5nZXMgYXJlIGZvcmJpZGRlbiwgcGxlYXNlIHNwZWNpZnkgZXhhY3QgdmVyc2lvbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdXN0IGEgcHVibGljIGdldHRlci5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldERlcGVuZGVuY2llcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZW5jaWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlcyBkZXBlbmRlbmNpZXMgaW50byBvbmUgbGlzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tICAgICAgICAgLSBkZXNjcmliZXMgd2hlcmUgdGhlIGRlcGVuZGVuY2llcyB3ZXJlIHNldFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXBlbmRlbmNpZXMgLSBkZXBlbmRlbmNpZXMgbGlzdFxuICAgICAqL1xuICAgIG1lcmdlRGVwZW5kZW5jaWVzKGZyb20sIGRlcGVuZGVuY2llcykge1xuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZURlcGVuZGVuY2llc1ZlcnNpb25zKGZyb20sIGRlcGVuZGVuY2llcykpIHtcbiAgICAgICAgICAgIHRoaXMuZGV0ZWN0RHVwbGljYXRlZERlcGVuZGVuY2llcyhmcm9tLCBkZXBlbmRlbmNpZXMpO1xuICAgICAgICAgICAgYXNzaWduSW4odGhpcy5kZXBlbmRlbmNpZXMsIGRlcGVuZGVuY2llcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIGRlcGVuZGVuY3kgdmVyc2lvbiB0eXBlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uIC0gdmVyc2lvbiBzdHJpbmcgb2YgdGhlIGRlcGVuZGVuY3lcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZGV0ZWN0RGVwZW5kZW5jeVZlcnNpb25UeXBlKHZlcnNpb24pIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IE9iamVjdC5rZXlzKHRoaXMucmVnZXhlcylcbiAgICAgICAgICAgIC5maW5kKGRlcGVuZGVuY3lUeXBlID0+IHRoaXMucmVnZXhlc1tkZXBlbmRlbmN5VHlwZV0udGVzdCh2ZXJzaW9uKSk7XG4gICAgICAgIHJldHVybiB0eXBlIHx8ICd2ZXJzaW9uJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgc2VtdmVyIGFuZCBkZXRlY3QgcmFuZ2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyb20gICAgICAgICAtIGRlc2NyaWJlcyB3aGVyZSB0aGUgZGVwZW5kZW5jaWVzIHdlcmUgc2V0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlcGVuZGVuY2llcyAtIGRlcGVuZGVuY2llcyBsaXN0XG4gICAgICovXG4gICAgdmFsaWRhdGVEZXBlbmRlbmNpZXNWZXJzaW9ucyhmcm9tLCBkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uc3Qgd2FybmluZ3NTaG93biA9IHt9O1xuICAgICAgICBmb3JFYWNoKGRlcGVuZGVuY2llcywgKHZlcnNpb24sIG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmRldGVjdERlcGVuZGVuY3lWZXJzaW9uVHlwZSh2ZXJzaW9uKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrc1t0eXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gdGhpcy5jaGVja3NbdHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrLnR5cGUgPT09ICdyZWdleCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hlY2tSZXN1bHQgPSBjaGVjay50ZXN0ID09PSAnbWF0Y2gnID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tzW3R5cGVdLnJlZ2V4LnRlc3QodmVyc2lvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIXRoaXMuY2hlY2tzW3R5cGVdLnJlZ2V4LnRlc3QodmVyc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2hlY2tSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZGVwZW5kZW5jeSAke25hbWV9OiR7dmVyc2lvbn0gZnJvbSAke2Zyb219IGZhaWxlZCB2ZXJzaW9uIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjaGVjayB3aXRoIG1lc3NhZ2U6ICR7dGhpcy5jaGVja3NbdHlwZV0ubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hlY2sudHlwZSA9PT0gJ3dhcm5pbmcnICYmICF3YXJuaW5nc1Nob3duW2NoZWNrLm9uY2VOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nc1Nob3duW2NoZWNrLm9uY2VOYW1lXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYGRlcGVuZGVuY3kgJHtuYW1lfToke3ZlcnNpb259IGZyb20gJHtmcm9tfSBjYXVzZWQgYWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCB3YXJuaW5nOiAke2NoZWNrLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0cyBkdXBsaWNhdGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyb20gICAgICAgICAtIGRlc2NyaWJlcyB3aGVyZSB0aGUgZGVwZW5kZW5jaWVzIHdlcmUgc2V0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlcGVuZGVuY2llcyAtIGRlcGVuZGVuY2llcyBsaXN0XG4gICAgICovXG4gICAgZGV0ZWN0RHVwbGljYXRlZERlcGVuZGVuY2llcyhmcm9tLCBkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uc3QgZHVwbGljYXRlcyA9IGludGVyc2VjdGlvbihPYmplY3Qua2V5cyhkZXBlbmRlbmNpZXMpLCBPYmplY3Qua2V5cyh0aGlzLmRlcGVuZGVuY2llcykpO1xuICAgICAgICBpZiAoZHVwbGljYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkdXBsaWNhdGVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGVwZW5kZW5jaWVzW25hbWVdICE9PSB0aGlzLmRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdoaWxlIHByb2Nlc3NpbmcgZGVwZW5kZW5jaWVzIGZyb20gJHtmcm9tfSwgYSBkZXBlbmRlbmN5IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCR7bmFtZX06ICR7ZGVwZW5kZW5jaWVzW25hbWVdfSB3YXMgZm91bmQgdG8gYmUgY29uZmxpY3Rpbmcgd2l0aCBhIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYGRlcGVuZGVuY3kgKCR7dGhpcy5kZXBlbmRlbmNpZXNbbmFtZV19KSB0aGF0IHdhcyBhbHJlYWR5IGRlY2xhcmVkIGluIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ290aGVyIG1vZHVsZSBvciBpdCBpcyB1c2VkIGluIGNvcmUgb2YgdGhlIGVsZWN0cm9uIGFwcC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==