#!/usr/bin/env node
'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assignIn = require('lodash/assignIn');

var _assignIn2 = _interopRequireDefault(_assignIn);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _ = require('../..');

var _2 = _interopRequireDefault(_);

var _addScript = require('../scripts/utils/addScript');

var _addScript2 = _interopRequireDefault(_addScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.MD_LOG_LEVEL = 'ALL';
/* eslint-disable global-require */


var join = _path2.default.join;
var cmd = process.argv[2];

/* eslint-disable no-console */
var log = console.log;
var error = console.error;
var info = console.info;
var warn = console.warn;
/* eslint-enable no-console */

/**
 * Looks for .meteor directory.
 * @param {string} appPath - Meteor app path
 */
function isMeteorApp(appPath) {
    var meteorPath = join(appPath, '.meteor');
    try {
        return _fs2.default.statSync(meteorPath).isDirectory();
    } catch (e) {
        return false;
    }
}

/**
 * Just ensures a ddp url is set.
 *
 * @param {string|null} ddpUrl - the url that Meteor app connects to
 * @returns {string|null}
 */
function getDdpUrl() {
    var ddpUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (!ddpUrl && _commander2.default.buildMeteor) {
        info('no ddp_url specified, setting default: http://127.0.0.1:3000');
        return 'http://127.0.0.1:3000';
    }
    return ddpUrl;
}

// --------------------------

_commander2.default.option('-b, --build-meteor', 'runs meteor to obtain the mobile build, kills it after').option('-t, --build-timeout <timeout_in_sec>', 'timeout value when waiting for ' + 'meteor to build, default 600sec').option('-p, --port <port>', 'port on which meteor is running, when with -b this will be passed to meteor when obtaining the build').option('--production', 'builds meteor app with the production switch, uglifies contents ' + 'of .desktop, packs app to app.asar').option('-a, --android', 'force adding android as a mobile platform instead of ios').option('-s, --scaffold', 'will scaffold .desktop if not present').option('--meteor-settings <path>', 'only with -b, adds --settings options to meteor').option('--ia32', 'generate 32bit installer/package').option('--all-archs', 'generate 32bit and 64bit installers').option('--win', 'generate Windows installer').option('--linux', 'generate Linux installer').option('--mac', 'generate Mac installer');

_commander2.default.usage('[command] [options]').version(require('./../../package.json').version, '-V, --version').on('--help', function () {
    log('  [ddp_url] - pass a ddp url if you want to use different one than used in meteor\'s --mobile-server');
    log('              this will also work with -b');
    log('    ');
    log('  Examples:');
    log('');
    log('   ', ['# cd into meteor dir first', 'cd /your/meteor/app', 'meteor --mobile-server=127.0.0.1:3000', '', '# open new terminal, assuming you have done npm install --save-dev meteor-desktop', 'npm run desktop -- init', 'npm run desktop'].join('\n    '));
    log('\n');
});

function verifyArgsSyntax() {
    if (process.env.npm_config_argv) {
        var npmArgv = void 0;
        try {
            var args = ['-b', '--build-meteor', '-t', '--build-timeout', '-p', '--port', '--production', '-a', '--android', '-s', '--scaffold', '--ia32', '--win', '--linux', '--all-archs', '--win', '--mac', '--meteor-settings'];
            npmArgv = JSON.parse(process.env.npm_config_argv);
            if (npmArgv.remain.length === 0 && npmArgv.original.length > 2) {
                if (npmArgv.original.some(function (arg) {
                    return !!~args.indexOf(arg);
                })) {
                    warn('WARNING: seems that you might used the wrong console syntax, no ` --' + ' ` delimiter was found, be sure you are invoking meteor-desktop with' + ' it when passing commands or options -> ' + '`npm run desktop -- command --option`\n');
                }
            }
        } catch (e) {
            // Not sure if `npm_config_argv` is always present...
        }
    }
}

function meteorDesktopFactory(ddpUrl) {
    var production = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    info('METEOR-DESKTOP v' + require('./../../package.json').version + '\n');

    verifyArgsSyntax();

    var input = process.cwd();

    if (!isMeteorApp(input)) {
        error('not in a meteor app dir\n ' + input);
        process.exit();
    }

    if (!_commander2.default.output) {
        _commander2.default.output = input;
    }

    if (production && !_commander2.default.production) {
        info('package/build-installer implies setting --production, setting it for you');
    }

    if (!_commander2.default.buildMeteor) {
        _commander2.default.port = _commander2.default.port || 3000;
        info('REMINDER: your Meteor project should be running now on port ' + _commander2.default.port + '\n');
    }

    var options = {
        ddpUrl: ddpUrl,
        skipMobileBuild: _commander2.default.buildMeteor ? !_commander2.default.buildMeteor : true,
        production: _commander2.default.production || production
    };

    (0, _assignIn2.default)(options, _commander2.default);

    return (0, _2.default)(input, _commander2.default.output, options);
}

function run(ddpUrl) {
    meteorDesktopFactory(getDdpUrl(ddpUrl)).run();
}

function build(ddpUrl) {
    meteorDesktopFactory(getDdpUrl(ddpUrl)).build();
}

function init() {
    meteorDesktopFactory().init();
}

function justRun() {
    meteorDesktopFactory().justRun();
}

function runPackager(ddpUrl) {
    meteorDesktopFactory(getDdpUrl(ddpUrl), true).runPackager();
}

function buildInstaller(ddpUrl) {
    meteorDesktopFactory(getDdpUrl(ddpUrl), true).buildInstaller();
}

function initTestsSupport() {
    log('installing cross-env, ava, meteor-desktop-test-suite and spectron');
    log('running `meteor npm install --save-dev cross-env ava spectron meteor-desktop-test-suite`');

    var code = _shelljs2.default.exec('meteor npm install --save-dev cross-env ava spectron meteor-desktop-test-suite').code;

    if (code !== 0) {
        warn('could not add cross-env, ava and spectron to your `devDependencies`, please do it' + ' manually');
    }

    var test = 'cross-env NODE_ENV=test ava .desktop/**/*.test.js -s --verbose';
    var testWatch = 'cross-env NODE_ENV=test ava .desktop/**/*.test.js -s --verbose' + ' --watch --source .desktop';

    function fail() {
        error('\ncould not add entries to `scripts` in package.json');
        log('please try to add it manually\n');
        log('test-desktop: ' + test);
        log('test-desktop-watch: ' + testWatch);
    }

    var packageJsonPath = _path2.default.resolve(_path2.default.join(process.cwd(), 'package.json'));

    (0, _addScript2.default)('test-desktop', test, packageJsonPath, fail);
    (0, _addScript2.default)('test-desktop-watch', testWatch, packageJsonPath, fail);

    log('\nadded test-desktop and test-desktop-watch entries');
    log('run the test with `npm run test-desktop`');
}

_commander2.default.command('init').description('scaffolds .desktop dir in the meteor app').action(init);

_commander2.default.command('run [ddp_url]').description('(default) builds and runs desktop app').action(run);

_commander2.default.command('build [ddp_url]').description('builds your desktop app').action(build);

_commander2.default.command('build-installer [ddp_url]').description('creates the installer').action(buildInstaller);

_commander2.default.command('just-run').description('alias for running `electron .` in `.meteor/desktop-build`').action(justRun);

_commander2.default.command('package [ddp_url]').description('runs electron packager').action(runPackager);

_commander2.default.command('init-tests-support').description('prepares project for running functional tests of desktop app').action(initTestsSupport);

if (process.argv.length === 2 || !~'-h|--help|run|init|build|build-installer|just-run|init-tests-support|package'.indexOf(cmd)) {
    var argv = process.argv;
    if (process.argv.length === 2) {
        argv.push('run');
    } else {
        var command = argv.splice(0, 2);
        command = command.concat('run', argv);
        argv = command;
    }
    _commander2.default.parse(argv);
} else {
    _commander2.default.parse(process.argv);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iaW4vY2xpLmpzIl0sIm5hbWVzIjpbInByb2Nlc3MiLCJlbnYiLCJNRF9MT0dfTEVWRUwiLCJqb2luIiwiY21kIiwiYXJndiIsImxvZyIsImNvbnNvbGUiLCJlcnJvciIsImluZm8iLCJ3YXJuIiwiaXNNZXRlb3JBcHAiLCJhcHBQYXRoIiwibWV0ZW9yUGF0aCIsInN0YXRTeW5jIiwiaXNEaXJlY3RvcnkiLCJlIiwiZ2V0RGRwVXJsIiwiZGRwVXJsIiwiYnVpbGRNZXRlb3IiLCJvcHRpb24iLCJ1c2FnZSIsInZlcnNpb24iLCJyZXF1aXJlIiwib24iLCJ2ZXJpZnlBcmdzU3ludGF4IiwibnBtX2NvbmZpZ19hcmd2IiwibnBtQXJndiIsImFyZ3MiLCJKU09OIiwicGFyc2UiLCJyZW1haW4iLCJsZW5ndGgiLCJvcmlnaW5hbCIsInNvbWUiLCJpbmRleE9mIiwiYXJnIiwibWV0ZW9yRGVza3RvcEZhY3RvcnkiLCJwcm9kdWN0aW9uIiwiaW5wdXQiLCJjd2QiLCJleGl0Iiwib3V0cHV0IiwicG9ydCIsIm9wdGlvbnMiLCJza2lwTW9iaWxlQnVpbGQiLCJydW4iLCJidWlsZCIsImluaXQiLCJqdXN0UnVuIiwicnVuUGFja2FnZXIiLCJidWlsZEluc3RhbGxlciIsImluaXRUZXN0c1N1cHBvcnQiLCJjb2RlIiwiZXhlYyIsInRlc3QiLCJ0ZXN0V2F0Y2giLCJmYWlsIiwicGFja2FnZUpzb25QYXRoIiwicmVzb2x2ZSIsImNvbW1hbmQiLCJkZXNjcmlwdGlvbiIsImFjdGlvbiIsInB1c2giLCJzcGxpY2UiLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7OztBQUVBQSxRQUFRQyxHQUFSLENBQVlDLFlBQVosR0FBMkIsS0FBM0I7QUFWQTs7O0FBWUEsSUFBTUMsT0FBTyxlQUFLQSxJQUFsQjtBQUNBLElBQU1DLE1BQU1KLFFBQVFLLElBQVIsQ0FBYSxD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VjtBQUNILEtBRkQsTUFFTztBQUNILFlBQUlILFVBQVV2RCxLQUFLMkQsTUFBTCxDQUFZLENBQVosRUFBZSxDQUFmLENBQWQ7QUFDQUosa0JBQVVBLFFBQVFLLE1BQVIsQ0FBZSxLQUFmLEVBQXNCNUQsSUFBdEIsQ0FBVjtBQUNBQSxlQUFPdUQsT0FBUDtBQUNIO0FBQ0Qsd0JBQVE5QixLQUFSLENBQWN6QixJQUFkO0FBQ0gsQ0FYRCxNQVdPO0FBQ0gsd0JBQVF5QixLQUFSLENBQWM5QixRQUFRSyxJQUF0QjtBQUNIIiwiZmlsZSI6ImNsaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyogZXNsaW50LWRpc2FibGUgZ2xvYmFsLXJlcXVpcmUgKi9cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBhc3NpZ25JbiBmcm9tICdsb2Rhc2gvYXNzaWduSW4nO1xuaW1wb3J0IHByb2dyYW0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IG1ldGVvckRlc2t0b3AgZnJvbSAnLi4vLi4nO1xuaW1wb3J0IGFkZFNjcmlwdCBmcm9tICcuLi9zY3JpcHRzL3V0aWxzL2FkZFNjcmlwdCc7XG5cbnByb2Nlc3MuZW52Lk1EX0xPR19MRVZFTCA9ICdBTEwnO1xuXG5jb25zdCBqb2luID0gcGF0aC5qb2luO1xuY29uc3QgY21kID0gcHJvY2Vzcy5hcmd2WzJdO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5jb25zdCBsb2cgPSBjb25zb2xlLmxvZztcbmNvbnN0IGVycm9yID0gY29uc29sZS5lcnJvcjtcbmNvbnN0IGluZm8gPSBjb25zb2xlLmluZm87XG5jb25zdCB3YXJuID0gY29uc29sZS53YXJuO1xuLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbi8qKlxuICogTG9va3MgZm9yIC5tZXRlb3IgZGlyZWN0b3J5LlxuICogQHBhcmFtIHtzdHJpbmd9IGFwcFBhdGggLSBNZXRlb3IgYXBwIHBhdGhcbiAqL1xuZnVuY3Rpb24gaXNNZXRlb3JBcHAoYXBwUGF0aCkge1xuICAgIGNvbnN0IG1ldGVvclBhdGggPSBqb2luKGFwcFBhdGgsICcubWV0ZW9yJyk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKG1ldGVvclBhdGgpLmlzRGlyZWN0b3J5KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEp1c3QgZW5zdXJlcyBhIGRkcCB1cmwgaXMgc2V0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IGRkcFVybCAtIHRoZSB1cmwgdGhhdCBNZXRlb3IgYXBwIGNvbm5lY3RzIHRvXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9XG4gKi9cbmZ1bmN0aW9uIGdldERkcFVybChkZHBVcmwgPSBudWxsKSB7XG4gICAgaWYgKCFkZHBVcmwgJiYgcHJvZ3JhbS5idWlsZE1ldGVvcikge1xuICAgICAgICBpbmZvKCdubyBkZHBfdXJsIHNwZWNpZmllZCwgc2V0dGluZyBkZWZhdWx0OiBodHRwOi8vMTI3LjAuMC4xOjMwMDAnKTtcbiAgICAgICAgcmV0dXJuICdodHRwOi8vMTI3LjAuMC4xOjMwMDAnO1xuICAgIH1cbiAgICByZXR1cm4gZGRwVXJsO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5wcm9ncmFtXG4gICAgLm9wdGlvbignLWIsIC0tYnVpbGQtbWV0ZW9yJywgJ3J1bnMgbWV0ZW9yIHRvIG9idGFpbiB0aGUgbW9iaWxlIGJ1aWxkLCBraWxscyBpdCBhZnRlcicpXG4gICAgLm9wdGlvbignLXQsIC0tYnVpbGQtdGltZW91dCA8dGltZW91dF9pbl9zZWM+JywgJ3RpbWVvdXQgdmFsdWUgd2hlbiB3YWl0aW5nIGZvciAnICtcbiAgICAgICAgJ21ldGVvciB0byBidWlsZCwgZGVmYXVsdCA2MDBzZWMnKVxuICAgIC5vcHRpb24oJy1wLCAtLXBvcnQgPHBvcnQ+JywgJ3BvcnQgb24gd2hpY2ggbWV0ZW9yIGlzIHJ1bm5pbmcsIHdoZW4gd2l0aCAtYiB0aGlzIHdpbGwgYmUgcGFzc2VkIHRvIG1ldGVvciB3aGVuIG9idGFpbmluZyB0aGUgYnVpbGQnKVxuICAgIC5vcHRpb24oJy0tcHJvZHVjdGlvbicsICdidWlsZHMgbWV0ZW9yIGFwcCB3aXRoIHRoZSBwcm9kdWN0aW9uIHN3aXRjaCwgdWdsaWZpZXMgY29udGVudHMgJyArXG4gICAgICAgICdvZiAuZGVza3RvcCwgcGFja3MgYXBwIHRvIGFwcC5hc2FyJylcbiAgICAub3B0aW9uKCctYSwgLS1hbmRyb2lkJywgJ2ZvcmNlIGFkZGluZyBhbmRyb2lkIGFzIGEgbW9iaWxlIHBsYXRmb3JtIGluc3RlYWQgb2YgaW9zJylcbiAgICAub3B0aW9uKCctcywgLS1zY2FmZm9sZCcsICd3aWxsIHNjYWZmb2xkIC5kZXNrdG9wIGlmIG5vdCBwcmVzZW50JylcbiAgICAub3B0aW9uKCctLW1ldGVvci1zZXR0aW5ncyA8cGF0aD4nLCAnb25seSB3aXRoIC1iLCBhZGRzIC0tc2V0dGluZ3Mgb3B0aW9ucyB0byBtZXRlb3InKVxuICAgIC5vcHRpb24oJy0taWEzMicsICdnZW5lcmF0ZSAzMmJpdCBpbnN0YWxsZXIvcGFja2FnZScpXG4gICAgLm9wdGlvbignLS1hbGwtYXJjaHMnLCAnZ2VuZXJhdGUgMzJiaXQgYW5kIDY0Yml0IGluc3RhbGxlcnMnKVxuICAgIC5vcHRpb24oJy0td2luJywgJ2dlbmVyYXRlIFdpbmRvd3MgaW5zdGFsbGVyJylcbiAgICAub3B0aW9uKCctLWxpbnV4JywgJ2dlbmVyYXRlIExpbnV4IGluc3RhbGxlcicpXG4gICAgLm9wdGlvbignLS1tYWMnLCAnZ2VuZXJhdGUgTWFjIGluc3RhbGxlcicpO1xuXG5wcm9ncmFtXG4gICAgLnVzYWdlKCdbY29tbWFuZF0gW29wdGlvbnNdJylcbiAgICAudmVyc2lvbihyZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24sICctViwgLS12ZXJzaW9uJylcbiAgICAub24oJy0taGVscCcsICgpID0+IHtcbiAgICAgICAgbG9nKCcgIFtkZHBfdXJsXSAtIHBhc3MgYSBkZHAgdXJsIGlmIHlvdSB3YW50IHRvIHVzZSBkaWZmZXJlbnQgb25lIHRoYW4gdXNlZCBpbiBtZXRlb3JcXCdzIC0tbW9iaWxlLXNlcnZlcicpO1xuICAgICAgICBsb2coJyAgICAgICAgICAgICAgdGhpcyB3aWxsIGFsc28gd29yayB3aXRoIC1iJyk7XG4gICAgICAgIGxvZygnICAgICcpO1xuICAgICAgICBsb2coJyAgRXhhbXBsZXM6Jyk7XG4gICAgICAgIGxvZygnJyk7XG4gICAgICAgIGxvZygnICAgJyxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnIyBjZCBpbnRvIG1ldGVvciBkaXIgZmlyc3QnLFxuICAgICAgICAgICAgICAgICdjZCAveW91ci9tZXRlb3IvYXBwJyxcbiAgICAgICAgICAgICAgICAnbWV0ZW9yIC0tbW9iaWxlLXNlcnZlcj0xMjcuMC4wLjE6MzAwMCcsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgJyMgb3BlbiBuZXcgdGVybWluYWwsIGFzc3VtaW5nIHlvdSBoYXZlIGRvbmUgbnBtIGluc3RhbGwgLS1zYXZlLWRldiBtZXRlb3ItZGVza3RvcCcsXG4gICAgICAgICAgICAgICAgJ25wbSBydW4gZGVza3RvcCAtLSBpbml0JyxcbiAgICAgICAgICAgICAgICAnbnBtIHJ1biBkZXNrdG9wJ1xuICAgICAgICAgICAgXS5qb2luKCdcXG4gICAgJylcbiAgICAgICAgKTtcbiAgICAgICAgbG9nKCdcXG4nKTtcbiAgICB9KTtcblxuXG5mdW5jdGlvbiB2ZXJpZnlBcmdzU3ludGF4KCkge1xuICAgIGlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX2FyZ3YpIHtcbiAgICAgICAgbGV0IG5wbUFyZ3Y7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gWyctYicsICctLWJ1aWxkLW1ldGVvcicsICctdCcsICctLWJ1aWxkLXRpbWVvdXQnLCAnLXAnLCAnLS1wb3J0JyxcbiAgICAgICAgICAgICAgICAnLS1wcm9kdWN0aW9uJywgJy1hJywgJy0tYW5kcm9pZCcsICctcycsICctLXNjYWZmb2xkJywgJy0taWEzMicsICctLXdpbicsXG4gICAgICAgICAgICAgICAgJy0tbGludXgnLCAnLS1hbGwtYXJjaHMnLCAnLS13aW4nLCAnLS1tYWMnLCAnLS1tZXRlb3Itc2V0dGluZ3MnXTtcbiAgICAgICAgICAgIG5wbUFyZ3YgPSBKU09OLnBhcnNlKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfYXJndik7XG4gICAgICAgICAgICBpZiAobnBtQXJndi5yZW1haW4ubGVuZ3RoID09PSAwICYmIG5wbUFyZ3Yub3JpZ2luYWwubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIGlmIChucG1Bcmd2Lm9yaWdpbmFsLnNvbWUoYXJnID0+ICEhfmFyZ3MuaW5kZXhPZihhcmcpKSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuKCdXQVJOSU5HOiBzZWVtcyB0aGF0IHlvdSBtaWdodCB1c2VkIHRoZSB3cm9uZyBjb25zb2xlIHN5bnRheCwgbm8gYCAtLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyBgIGRlbGltaXRlciB3YXMgZm91bmQsIGJlIHN1cmUgeW91IGFyZSBpbnZva2luZyBtZXRlb3ItZGVza3RvcCB3aXRoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGl0IHdoZW4gcGFzc2luZyBjb21tYW5kcyBvciBvcHRpb25zIC0+ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2BucG0gcnVuIGRlc2t0b3AgLS0gY29tbWFuZCAtLW9wdGlvbmBcXG4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5vdCBzdXJlIGlmIGBucG1fY29uZmlnX2FyZ3ZgIGlzIGFsd2F5cyBwcmVzZW50Li4uXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ldGVvckRlc2t0b3BGYWN0b3J5KGRkcFVybCwgcHJvZHVjdGlvbiA9IGZhbHNlKSB7XG4gICAgaW5mbyhgTUVURU9SLURFU0tUT1AgdiR7cmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9ufVxcbmApO1xuXG4gICAgdmVyaWZ5QXJnc1N5bnRheCgpO1xuXG4gICAgY29uc3QgaW5wdXQgPSBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgaWYgKCFpc01ldGVvckFwcChpbnB1dCkpIHtcbiAgICAgICAgZXJyb3IoYG5vdCBpbiBhIG1ldGVvciBhcHAgZGlyXFxuICR7aW5wdXR9YCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgpO1xuICAgIH1cblxuICAgIGlmICghcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgcHJvZ3JhbS5vdXRwdXQgPSBpbnB1dDtcbiAgICB9XG5cbiAgICBpZiAocHJvZHVjdGlvbiAmJiAhcHJvZ3JhbS5wcm9kdWN0aW9uKSB7XG4gICAgICAgIGluZm8oJ3BhY2thZ2UvYnVpbGQtaW5zdGFsbGVyIGltcGxpZXMgc2V0dGluZyAtLXByb2R1Y3Rpb24sIHNldHRpbmcgaXQgZm9yIHlvdScpO1xuICAgIH1cblxuICAgIGlmICghcHJvZ3JhbS5idWlsZE1ldGVvcikge1xuICAgICAgICBwcm9ncmFtLnBvcnQgPSBwcm9ncmFtLnBvcnQgfHwgMzAwMDtcbiAgICAgICAgaW5mbyhgUkVNSU5ERVI6IHlvdXIgTWV0ZW9yIHByb2plY3Qgc2hvdWxkIGJlIHJ1bm5pbmcgbm93IG9uIHBvcnQgJHtwcm9ncmFtLnBvcnR9XFxuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGRwVXJsLFxuICAgICAgICBza2lwTW9iaWxlQnVpbGQ6IHByb2dyYW0uYnVpbGRNZXRlb3IgPyAhcHJvZ3JhbS5idWlsZE1ldGVvciA6IHRydWUsXG4gICAgICAgIHByb2R1Y3Rpb246IHByb2dyYW0ucHJvZHVjdGlvbiB8fCBwcm9kdWN0aW9uXG4gICAgfTtcblxuICAgIGFzc2lnbkluKG9wdGlvbnMsIHByb2dyYW0pO1xuXG4gICAgcmV0dXJuIG1ldGVvckRlc2t0b3AoXG4gICAgICAgIGlucHV0LFxuICAgICAgICBwcm9ncmFtLm91dHB1dCxcbiAgICAgICAgb3B0aW9uc1xuICAgICk7XG59XG5cbmZ1bmN0aW9uIHJ1bihkZHBVcmwpIHtcbiAgICBtZXRlb3JEZXNrdG9wRmFjdG9yeShnZXREZHBVcmwoZGRwVXJsKSkucnVuKCk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkKGRkcFVybCkge1xuICAgIG1ldGVvckRlc2t0b3BGYWN0b3J5KGdldERkcFVybChkZHBVcmwpKS5idWlsZCgpO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIG1ldGVvckRlc2t0b3BGYWN0b3J5KCkuaW5pdCgpO1xufVxuXG5mdW5jdGlvbiBqdXN0UnVuKCkge1xuICAgIG1ldGVvckRlc2t0b3BGYWN0b3J5KCkuanVzdFJ1bigpO1xufVxuXG5mdW5jdGlvbiBydW5QYWNrYWdlcihkZHBVcmwpIHtcbiAgICBtZXRlb3JEZXNrdG9wRmFjdG9yeShnZXREZHBVcmwoZGRwVXJsKSwgdHJ1ZSkucnVuUGFja2FnZXIoKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRJbnN0YWxsZXIoZGRwVXJsKSB7XG4gICAgbWV0ZW9yRGVza3RvcEZhY3RvcnkoZ2V0RGRwVXJsKGRkcFVybCksIHRydWUpLmJ1aWxkSW5zdGFsbGVyKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRUZXN0c1N1cHBvcnQoKSB7XG4gICAgbG9nKCdpbnN0YWxsaW5nIGNyb3NzLWVudiwgYXZhLCBtZXRlb3ItZGVza3RvcC10ZXN0LXN1aXRlIGFuZCBzcGVjdHJvbicpO1xuICAgIGxvZygncnVubmluZyBgbWV0ZW9yIG5wbSBpbnN0YWxsIC0tc2F2ZS1kZXYgY3Jvc3MtZW52IGF2YSBzcGVjdHJvbiBtZXRlb3ItZGVza3RvcC10ZXN0LXN1aXRlYCcpO1xuXG4gICAgY29uc3QgY29kZSA9IHNoZWxsLmV4ZWMoJ21ldGVvciBucG0gaW5zdGFsbCAtLXNhdmUtZGV2IGNyb3NzLWVudiBhdmEgc3BlY3Ryb24gbWV0ZW9yLWRlc2t0b3AtdGVzdC1zdWl0ZScpLmNvZGU7XG5cbiAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICB3YXJuKCdjb3VsZCBub3QgYWRkIGNyb3NzLWVudiwgYXZhIGFuZCBzcGVjdHJvbiB0byB5b3VyIGBkZXZEZXBlbmRlbmNpZXNgLCBwbGVhc2UgZG8gaXQnICtcbiAgICAgICAgICAgICcgbWFudWFsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXN0ID0gJ2Nyb3NzLWVudiBOT0RFX0VOVj10ZXN0IGF2YSAuZGVza3RvcC8qKi8qLnRlc3QuanMgLXMgLS12ZXJib3NlJztcbiAgICBjb25zdCB0ZXN0V2F0Y2ggPSAnY3Jvc3MtZW52IE5PREVfRU5WPXRlc3QgYXZhIC5kZXNrdG9wLyoqLyoudGVzdC5qcyAtcyAtLXZlcmJvc2UnICtcbiAgICAgICAgJyAtLXdhdGNoIC0tc291cmNlIC5kZXNrdG9wJztcblxuICAgIGZ1bmN0aW9uIGZhaWwoKSB7XG4gICAgICAgIGVycm9yKCdcXG5jb3VsZCBub3QgYWRkIGVudHJpZXMgdG8gYHNjcmlwdHNgIGluIHBhY2thZ2UuanNvbicpO1xuICAgICAgICBsb2coJ3BsZWFzZSB0cnkgdG8gYWRkIGl0IG1hbnVhbGx5XFxuJyk7XG4gICAgICAgIGxvZyhgdGVzdC1kZXNrdG9wOiAke3Rlc3R9YCk7XG4gICAgICAgIGxvZyhgdGVzdC1kZXNrdG9wLXdhdGNoOiAke3Rlc3RXYXRjaH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZS5qc29uJykpO1xuXG4gICAgYWRkU2NyaXB0KCd0ZXN0LWRlc2t0b3AnLCB0ZXN0LCBwYWNrYWdlSnNvblBhdGgsIGZhaWwpO1xuICAgIGFkZFNjcmlwdCgndGVzdC1kZXNrdG9wLXdhdGNoJywgdGVzdFdhdGNoLCBwYWNrYWdlSnNvblBhdGgsIGZhaWwpO1xuXG4gICAgbG9nKCdcXG5hZGRlZCB0ZXN0LWRlc2t0b3AgYW5kIHRlc3QtZGVza3RvcC13YXRjaCBlbnRyaWVzJyk7XG4gICAgbG9nKCdydW4gdGhlIHRlc3Qgd2l0aCBgbnBtIHJ1biB0ZXN0LWRlc2t0b3BgJyk7XG59XG5cbnByb2dyYW1cbiAgICAuY29tbWFuZCgnaW5pdCcpXG4gICAgLmRlc2NyaXB0aW9uKCdzY2FmZm9sZHMgLmRlc2t0b3AgZGlyIGluIHRoZSBtZXRlb3IgYXBwJylcbiAgICAuYWN0aW9uKGluaXQpO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ3J1biBbZGRwX3VybF0nKVxuICAgIC5kZXNjcmlwdGlvbignKGRlZmF1bHQpIGJ1aWxkcyBhbmQgcnVucyBkZXNrdG9wIGFwcCcpXG4gICAgLmFjdGlvbihydW4pO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ2J1aWxkIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdidWlsZHMgeW91ciBkZXNrdG9wIGFwcCcpXG4gICAgLmFjdGlvbihidWlsZCk7XG5cbnByb2dyYW1cbiAgICAuY29tbWFuZCgnYnVpbGQtaW5zdGFsbGVyIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdjcmVhdGVzIHRoZSBpbnN0YWxsZXInKVxuICAgIC5hY3Rpb24oYnVpbGRJbnN0YWxsZXIpO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ2p1c3QtcnVuJylcbiAgICAuZGVzY3JpcHRpb24oJ2FsaWFzIGZvciBydW5uaW5nIGBlbGVjdHJvbiAuYCBpbiBgLm1ldGVvci9kZXNrdG9wLWJ1aWxkYCcpXG4gICAgLmFjdGlvbihqdXN0UnVuKTtcblxucHJvZ3JhbVxuICAgIC5jb21tYW5kKCdwYWNrYWdlIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdydW5zIGVsZWN0cm9uIHBhY2thZ2VyJylcbiAgICAuYWN0aW9uKHJ1blBhY2thZ2VyKTtcblxucHJvZ3JhbVxuICAgIC5jb21tYW5kKCdpbml0LXRlc3RzLXN1cHBvcnQnKVxuICAgIC5kZXNjcmlwdGlvbigncHJlcGFyZXMgcHJvamVjdCBmb3IgcnVubmluZyBmdW5jdGlvbmFsIHRlc3RzIG9mIGRlc2t0b3AgYXBwJylcbiAgICAuYWN0aW9uKGluaXRUZXN0c1N1cHBvcnQpO1xuXG5pZiAocHJvY2Vzcy5hcmd2Lmxlbmd0aCA9PT0gMiB8fCAhfignLWh8LS1oZWxwfHJ1bnxpbml0fGJ1aWxkfGJ1aWxkLWluc3RhbGxlcnxqdXN0LXJ1bnxpbml0LXRlc3RzLXN1cHBvcnR8cGFja2FnZScuaW5kZXhPZihjbWQpKVxuKSB7XG4gICAgbGV0IGFyZ3YgPSBwcm9jZXNzLmFyZ3Y7XG4gICAgaWYgKHByb2Nlc3MuYXJndi5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgYXJndi5wdXNoKCdydW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY29tbWFuZCA9IGFyZ3Yuc3BsaWNlKDAsIDIpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZC5jb25jYXQoJ3J1bicsIGFyZ3YpO1xuICAgICAgICBhcmd2ID0gY29tbWFuZDtcbiAgICB9XG4gICAgcHJvZ3JhbS5wYXJzZShhcmd2KTtcbn0gZWxzZSB7XG4gICAgcHJvZ3JhbS5wYXJzZShwcm9jZXNzLmFyZ3YpO1xufVxuIl19