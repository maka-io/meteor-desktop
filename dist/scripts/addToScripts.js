'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _addScript = require('./utils/addScript');

var _addScript2 = _interopRequireDefault(_addScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This script adds a 'desktop' entry to 'scripts' in package.json. If the entry already exists
 * it leaves it untouched.
 */
/* eslint-disable no-console */
function fail() {
    console.error('[meteor-desktop] failed to add meteor-desktop to your package.json scripts, ' + 'please add it manually as \'desktop\': \'meteor-desktop\'');
    process.exit(0);
}

var packageJsonPath = _path2.default.resolve(_path2.default.join(__dirname, '..', '..', '..', '..', 'package.json'));

(0, _addScript2.default)('desktop', 'meteor-desktop', packageJsonPath, fail);

console.log('[meteor-desktop] successfully added a \'desktop\' entry to your package.json' + ' scripts section.');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zY3JpcHRzL2FkZFRvU2NyaXB0cy5qcyJdLCJuYW1lcyI6WyJmYWlsIiwiY29uc29sZSIsImVycm9yIiwicHJvY2VzcyIsImV4aXQiLCJwYWNrYWdlSnNvblBhdGgiLCJyZXNvbHZlIiwiam9pbiIsIl9fZGlybmFtZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7OztBQUVBOzs7Ozs7QUFDQTs7OztBQUpBO0FBUUEsU0FBU0EsSUFBVCxHQUFnQjtBQUNaQyxZQUFRQyxLQUFSLENBQWMsaUZBQ1YsMkRBREo7QUFFQUMsWUFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDs7QUFFRCxJQUFNQyxrQkFBa0IsZUFBS0MsT0FBTCxDQUNwQixlQUFLQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsSUFBakMsRUFBdUMsSUFBdkMsRUFBNkMsY0FBN0MsQ0FEb0IsQ0FBeEI7O0FBR0EseUJBQVUsU0FBVixFQUFxQixnQkFBckIsRUFBdUNILGVBQXZDLEVBQXdETCxJQUF4RDs7QUFFQUMsUUFBUVEsR0FBUixDQUFZLGlGQUNSLG1CQURKIiwiZmlsZSI6ImFkZFRvU2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgYWRkU2NyaXB0IGZyb20gJy4vdXRpbHMvYWRkU2NyaXB0Jztcbi8qKlxuICogVGhpcyBzY3JpcHQgYWRkcyBhICdkZXNrdG9wJyBlbnRyeSB0byAnc2NyaXB0cycgaW4gcGFja2FnZS5qc29uLiBJZiB0aGUgZW50cnkgYWxyZWFkeSBleGlzdHNcbiAqIGl0IGxlYXZlcyBpdCB1bnRvdWNoZWQuXG4gKi9cbmZ1bmN0aW9uIGZhaWwoKSB7XG4gICAgY29uc29sZS5lcnJvcignW21ldGVvci1kZXNrdG9wXSBmYWlsZWQgdG8gYWRkIG1ldGVvci1kZXNrdG9wIHRvIHlvdXIgcGFja2FnZS5qc29uIHNjcmlwdHMsICcgK1xuICAgICAgICAncGxlYXNlIGFkZCBpdCBtYW51YWxseSBhcyBcXCdkZXNrdG9wXFwnOiBcXCdtZXRlb3ItZGVza3RvcFxcJycpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICcuLicsICdwYWNrYWdlLmpzb24nKSk7XG5cbmFkZFNjcmlwdCgnZGVza3RvcCcsICdtZXRlb3ItZGVza3RvcCcsIHBhY2thZ2VKc29uUGF0aCwgZmFpbCk7XG5cbmNvbnNvbGUubG9nKCdbbWV0ZW9yLWRlc2t0b3BdIHN1Y2Nlc3NmdWxseSBhZGRlZCBhIFxcJ2Rlc2t0b3BcXCcgZW50cnkgdG8geW91ciBwYWNrYWdlLmpzb24nICtcbiAgICAnIHNjcmlwdHMgc2VjdGlvbi4nKTtcbiJdfQ==