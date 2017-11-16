'use strict';

// This propagates the version from package.json to Meteor plugins.

var version = require('../../package.json').version;
var fs = require('fs');

var paths = ['./plugins/bundler/package.js', './plugins/watcher/package.js'];
paths.forEach(function (path) {
    var packageJs = fs.readFileSync(path, 'UTF-8');
    packageJs = packageJs.replace(/(version: ')([^']+)'/, '$1' + version + '\'');
    if (~path.indexOf('watcher')) {
        packageJs = packageJs.replace(/(omega:meteor-desktop-bundler@)([^']+)'/, '$1' + version + '\'');
    }
    fs.writeFileSync(path, packageJs);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zY3JpcHRzL3Byb3BhZ2F0ZVZlcnNpb24uanMiXSwibmFtZXMiOlsidmVyc2lvbiIsInJlcXVpcmUiLCJmcyIsInBhdGhzIiwiZm9yRWFjaCIsInBhdGgiLCJwYWNrYWdlSnMiLCJyZWFkRmlsZVN5bmMiLCJyZXBsYWNlIiwiaW5kZXhPZiIsIndyaXRlRmlsZVN5bmMiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBRUEsSUFBTUEsVUFBVUMsUUFBUSxvQkFBUixFQUE4QkQsT0FBOUM7QUFDQSxJQUFNRSxLQUFLRCxRQUFRLElBQVIsQ0FBWDs7QUFFQSxJQUFNRSxRQUFRLENBQUMsOEJBQUQsRUFBaUMsOEJBQWpDLENBQWQ7QUFDQUEsTUFBTUMsT0FBTixDQUFjLFVBQUNDLElBQUQsRUFBVTtBQUNwQixRQUFJQyxZQUFZSixHQUFHSyxZQUFILENBQWdCRixJQUFoQixFQUFzQixPQUF0QixDQUFoQjtBQUNBQyxnQkFBWUEsVUFBVUUsT0FBVixDQUFrQixzQkFBbEIsU0FBK0NSLE9BQS9DLFFBQVo7QUFDQSxRQUFJLENBQUNLLEtBQUtJLE9BQUwsQ0FBYSxTQUFiLENBQUwsRUFBOEI7QUFDMUJILG9CQUFZQSxVQUFVRSxPQUFWLENBQWtCLHlDQUFsQixTQUFrRVIsT0FBbEUsUUFBWjtBQUNIO0FBQ0RFLE9BQUdRLGFBQUgsQ0FBaUJMLElBQWpCLEVBQXVCQyxTQUF2QjtBQUNILENBUEQiLCJmaWxlIjoicHJvcGFnYXRlVmVyc2lvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgcHJvcGFnYXRlcyB0aGUgdmVyc2lvbiBmcm9tIHBhY2thZ2UuanNvbiB0byBNZXRlb3IgcGx1Z2lucy5cblxuY29uc3QgdmVyc2lvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbmNvbnN0IHBhdGhzID0gWycuL3BsdWdpbnMvYnVuZGxlci9wYWNrYWdlLmpzJywgJy4vcGx1Z2lucy93YXRjaGVyL3BhY2thZ2UuanMnXTtcbnBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcbiAgICBsZXQgcGFja2FnZUpzID0gZnMucmVhZEZpbGVTeW5jKHBhdGgsICdVVEYtOCcpO1xuICAgIHBhY2thZ2VKcyA9IHBhY2thZ2VKcy5yZXBsYWNlKC8odmVyc2lvbjogJykoW14nXSspJy8sIGAkMSR7dmVyc2lvbn0nYCk7XG4gICAgaWYgKH5wYXRoLmluZGV4T2YoJ3dhdGNoZXInKSkge1xuICAgICAgICBwYWNrYWdlSnMgPSBwYWNrYWdlSnMucmVwbGFjZSgvKG9tZWdhOm1ldGVvci1kZXNrdG9wLWJ1bmRsZXJAKShbXiddKyknLywgYCQxJHt2ZXJzaW9ufSdgKTtcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBwYWNrYWdlSnMpO1xufSk7XG4iXX0=