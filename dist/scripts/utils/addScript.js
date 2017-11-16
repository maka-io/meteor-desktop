'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = addScript;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readJsonFile(jsonFilePath) {
    try {
        return JSON.parse(_fs2.default.readFileSync(jsonFilePath, 'UTF-8'));
    } catch (e) {
        return false;
    }
}

function writeJsonFile(jsonFilePath, jsonContents) {
    try {
        _fs2.default.writeFileSync(jsonFilePath, (0, _stringify2.default)(jsonContents, null, 2));
    } catch (e) {
        return false;
    }
    return true;
}

function addScript(name, script, packageJsonPath, fail) {
    var packageJson = readJsonFile(packageJsonPath);
    if (!(packageJson && packageJson.name)) {
        fail();
        return;
    }

    if (!('scripts' in packageJson)) {
        packageJson.scripts = {};
    }

    if (!(name in packageJson.scripts)) {
        packageJson.scripts[name] = script;
    }

    if (!writeJsonFile(packageJsonPath, packageJson)) {
        fail();
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zY3JpcHRzL3V0aWxzL2FkZFNjcmlwdC5qcyJdLCJuYW1lcyI6WyJhZGRTY3JpcHQiLCJyZWFkSnNvbkZpbGUiLCJqc29uRmlsZVBhdGgiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwid3JpdGVKc29uRmlsZSIsImpzb25Db250ZW50cyIsIndyaXRlRmlsZVN5bmMiLCJuYW1lIiwic2NyaXB0IiwicGFja2FnZUpzb25QYXRoIiwiZmFpbCIsInBhY2thZ2VKc29uIiwic2NyaXB0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztrQkFtQndCQSxTOztBQW5CeEI7Ozs7OztBQUVBLFNBQVNDLFlBQVQsQ0FBc0JDLFlBQXRCLEVBQW9DO0FBQ2hDLFFBQUk7QUFDQSxlQUFPQyxLQUFLQyxLQUFMLENBQVcsYUFBR0MsWUFBSCxDQUFnQkgsWUFBaEIsRUFBOEIsT0FBOUIsQ0FBWCxDQUFQO0FBQ0gsS0FGRCxDQUVFLE9BQU9JLENBQVAsRUFBVTtBQUNSLGVBQU8sS0FBUDtBQUNIO0FBQ0o7O0FBRUQsU0FBU0MsYUFBVCxDQUF1QkwsWUFBdkIsRUFBcUNNLFlBQXJDLEVBQW1EO0FBQy9DLFFBQUk7QUFDQSxxQkFBR0MsYUFBSCxDQUFpQlAsWUFBakIsRUFBK0IseUJBQWVNLFlBQWYsRUFBNkIsSUFBN0IsRUFBbUMsQ0FBbkMsQ0FBL0I7QUFDSCxLQUZELENBRUUsT0FBT0YsQ0FBUCxFQUFVO0FBQ1IsZUFBTyxLQUFQO0FBQ0g7QUFDRCxXQUFPLElBQVA7QUFDSDs7QUFFYyxTQUFTTixTQUFULENBQW1CVSxJQUFuQixFQUF5QkMsTUFBekIsRUFBaUNDLGVBQWpDLEVBQWtEQyxJQUFsRCxFQUF3RDtBQUNuRSxRQUFNQyxjQUFjYixhQUFhVyxlQUFiLENBQXBCO0FBQ0EsUUFBSSxFQUFFRSxlQUFlQSxZQUFZSixJQUE3QixDQUFKLEVBQXdDO0FBQ3BDRztBQUNBO0FBQ0g7O0FBRUQsUUFBSSxFQUFFLGFBQWFDLFdBQWYsQ0FBSixFQUFpQztBQUM3QkEsb0JBQVlDLE9BQVosR0FBc0IsRUFBdEI7QUFDSDs7QUFFRCxRQUFJLEVBQUVMLFFBQVFJLFlBQVlDLE9BQXRCLENBQUosRUFBb0M7QUFDaENELG9CQUFZQyxPQUFaLENBQW9CTCxJQUFwQixJQUE0QkMsTUFBNUI7QUFDSDs7QUFFRCxRQUFJLENBQUNKLGNBQWNLLGVBQWQsRUFBK0JFLFdBQS9CLENBQUwsRUFBa0Q7QUFDOUNEO0FBQ0g7QUFDSiIsImZpbGUiOiJhZGRTY3JpcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5mdW5jdGlvbiByZWFkSnNvbkZpbGUoanNvbkZpbGVQYXRoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGpzb25GaWxlUGF0aCwgJ1VURi04JykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVKc29uRmlsZShqc29uRmlsZVBhdGgsIGpzb25Db250ZW50cykge1xuICAgIHRyeSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoanNvbkZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShqc29uQ29udGVudHMsIG51bGwsIDIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZFNjcmlwdChuYW1lLCBzY3JpcHQsIHBhY2thZ2VKc29uUGF0aCwgZmFpbCkge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uID0gcmVhZEpzb25GaWxlKHBhY2thZ2VKc29uUGF0aCk7XG4gICAgaWYgKCEocGFja2FnZUpzb24gJiYgcGFja2FnZUpzb24ubmFtZSkpIHtcbiAgICAgICAgZmFpbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoJ3NjcmlwdHMnIGluIHBhY2thZ2VKc29uKSkge1xuICAgICAgICBwYWNrYWdlSnNvbi5zY3JpcHRzID0ge307XG4gICAgfVxuXG4gICAgaWYgKCEobmFtZSBpbiBwYWNrYWdlSnNvbi5zY3JpcHRzKSkge1xuICAgICAgICBwYWNrYWdlSnNvbi5zY3JpcHRzW25hbWVdID0gc2NyaXB0O1xuICAgIH1cblxuICAgIGlmICghd3JpdGVKc29uRmlsZShwYWNrYWdlSnNvblBhdGgsIHBhY2thZ2VKc29uKSkge1xuICAgICAgICBmYWlsKCk7XG4gICAgfVxufVxuIl19