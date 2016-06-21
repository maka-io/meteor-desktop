/**
 This is a slightly modified JS port of hot code push android client from here:
 https://github.com/meteor/cordova-plugin-meteor-webapp

 The MIT License (MIT)

 Copyright (c) 2015 Meteor Development Group

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 This is based on:
 /cordova-plugin-meteor-webapp/blob/master/src/android/AssetBundle.java

 */

var path = require('path');
var fs = require('fs');
var url = require('url');

var Log = require('./logger');
var AssetManifest = require('./assetManifest');

/**
 * Represent single asset in the bundle.
 *
 * @property {string} filePath
 * @property {string} urlPath
 * @property {string} fileType
 * @property {number} size
 * @property {bool}   cacheable
 * @property {string} hash
 * @property {string} sourceMapFilePath
 * @property {string} sourceMapUrlPath
 * @property {AssetBundle} bundle
 * @constructor
 */
function Asset(filePath, urlPath, fileType, cacheable, hash, sourceMapUrlPath, size, bundle) {
    this.filePath = filePath;
    this.urlPath = urlPath;
    this.fileType = fileType;
    this.cacheable = cacheable;
    this.hash = hash;
    this.entrySize = size;
    this.sourceMapUrlPath = sourceMapUrlPath;
    this.bundle = bundle;

    this.getFile = function getFile() {
        return path.join(this.bundle.directoryUri, filePath);
    };
}

/**
 * Represents assets bundle.
 *
 * @param {object}        l                 - Logger instance.
 * @param {string}        directoryUri      - Where the bundle lies in the file system.
 * @param {AssetManifest=} manifest          - Bundle's manifest.
 * @param {AssetBundle=}   parentAssetBundle - Parent asset bundle.
 * @constructor
 */
function AssetBundle(l, directoryUri, manifest, parentAssetBundle) {
    var self = this;
    var indexFile;

    this.log = new Log('AssetBundle', l);
    this.log.log('debug', 'Creating bundle object for ' + directoryUri);

    this.directoryUri = directoryUri;

    this.runtimeConfig = null;
    this.appId = null;
    this.rootUrlString = null;
    this.matcher = new RegExp('__meteor_runtime_config__ = JSON.parse\\(decodeURIComponent\\("([^"]*)"\\)\\)');

    this.parentAssetBundle = parentAssetBundle;

    if (manifest === undefined) {
        this.log.log('debug', 'Loading my manifest from ' + directoryUri);
        this.manifest = this.loadAssetManifest();
    } else {
        this.manifest = manifest;
    }

    this.version = this.manifest.version;
    this.cordovaCompatibilityVersion = this.manifest.cordovaCompatibilityVersion;

    this.ownAssetsByURLPath = {};

    // Filter assets that are only in this bundle. Rest can be taken from the parent.
    this.manifest.entries.forEach(function filterDistinctAssets(entry) {
        var urlPath = url.parse(entry.urlPath).pathname;

        if (parentAssetBundle === undefined || parentAssetBundle.cachedAssetForUrlPath(urlPath, entry.hash) === null) {
            self.addAsset(new Asset(entry.filePath, urlPath, entry.fileType, entry.cacheable, entry.hash, entry.sourceMapUrlPath, entry.size, self));
        }

        if (entry.sourceMapFilePath !== null && entry.sourceMapUrlPath !== null) {
            if (parentAssetBundle === undefined || parentAssetBundle.cachedAssetForUrlPath(entry.sourceMapUrlPath, null) === null) {
                self.addAsset(new Asset(entry.sourceMapFilePath, entry.sourceMapUrlPath, 'json', true, null, null, entry.size, self));
            }
        }
    });

    indexFile = new Asset('index.html', '/', 'html', false, null, null, null, this);
    this.addAsset(indexFile);
    this.indexFile = indexFile;
}

/**
 * Directory uri getter.
 * @returns {string}
 */
AssetBundle.prototype.getDirectoryUri = function getDirectoryUri() {
    return this.directoryUri;
};

/**
 * Parent asset bundle getter.
 * @returns {null|AssetBundle}
 */
AssetBundle.prototype.getParentAssetBundle = function getParentAssetBundle() {
    return this.parentAssetBundle;
};

/**
 * Returns an cacheable or hash equal asset.
 *
 * @param {string} urlPath - The url path of the asset.
 * @param {string|null} hash    - Hash of the asset.
 * @returns {null|Asset}
 */
AssetBundle.prototype.cachedAssetForUrlPath = function cachedAssetForUrlPath(urlPath, hash) {
    var asset;

    if (!(urlPath in this.ownAssetsByURLPath)) return null;
    asset = this.ownAssetsByURLPath[urlPath];

    // If the asset is not cacheable, we require a matching hash.
    if (asset.cacheable && hash === null || asset.hash !== null && asset.hash === hash) {
        return asset;
    }

    return null;
};

/**
 * Returns an array of own assets.
 *
 * @returns {Array}
 */
AssetBundle.prototype.getOwnAssets = function getOwnAssets() {
    var self = this;
    return Object.keys(this.ownAssetsByURLPath).reduce(function reduceKeys(arr, key) {
        arr.push(self.ownAssetsByURLPath[key]);
        return arr;
    }, []);
};
/**
 * Version getter.
 * @returns {string}
 */
AssetBundle.prototype.getVersion = function getVersion() {
    return this.version;
};

/**
 * Loads runtime config.
 *
 * @returns {Object}
 */
AssetBundle.prototype.getRuntimeConfig = function getRuntimeConfig() {
    if (this.runtimeConfig === null) {
        this.runtimeConfig = this.loadRuntimeConfig(path.join(this.directoryUri, this.indexFile.filePath));
    }
    return this.runtimeConfig;
};

/**
 * App id getter.
 *
 * @returns {String}
 */
AssetBundle.prototype.getAppId = function getAppId() {
    var runtimeConfig;
    if (this.appId === null) {
        runtimeConfig = this.getRuntimeConfig();
        if (runtimeConfig !== null) {
            if (!('appId' in runtimeConfig)) {
                this.log.log('error', 'Error reading APP_ID from runtime config');
            } else {
                this.appId = runtimeConfig.appId;
            }
        }
    }
    return this.appId;
};

/**
 * Return ROOT_URL from runtime config.
 *
 * @returns {string}
 */
AssetBundle.prototype.getRootUrlString = function getRootUrlString() {
    var runtimeConfig;
    if (this.rootUrlString === null) {
        runtimeConfig = this.getRuntimeConfig();
        if (runtimeConfig !== null) {
            if (!('ROOT_URL' in runtimeConfig)) {
                this.log.log('error', 'Error reading ROOT_URL from runtime config');
            } else {
                this.rootUrlString = runtimeConfig.ROOT_URL;
            }
        }
    }
    return this.rootUrlString;
};

/**
 * Changes bundles directory uri.
 *
 * @param {string} directoryUri - New directory path.
 */
AssetBundle.prototype.didMoveToDirectoryAtUri = function didMoveToDirectoryAtUri(directoryUri) {
    this.directoryUri = directoryUri;
};

/**
 * Returns asset queried by url path.
 * !UNUSED! Left in case of implementation change.
 *
 * @param {string} urlPath - Url path of the asset.
 *
 * @returns {Asset}
 */
AssetBundle.prototype.assetForUrlPath = function _assetForUrlPath(urlPath) {
    var asset;

    if (urlPath in this.ownAssetsByURLPath) {
        asset = this.ownAssetsByURLPath[urlPath];
    } else {
        if (this.parentAssetBundle !== null) {
            asset = this.parentAssetBundle.assetForUrlPath(urlPath);
        }
    }
    return asset;
};

/**
 * Load this bundle's asset manifest.
 *
 * @private
 * @returns {AssetManifest}
 */
AssetBundle.prototype._loadAssetManifest = function _loadAssetManifest() {
    var msg;
    var manifestPath = path.join(this.directoryUri, 'program.json');
    try {
        return new AssetManifest(this.log.getUnwrappedLogger(), fs.readFileSync(manifestPath, 'UTF-8'));
    } catch (e) {
        msg = 'Error loading asset manifest: ' + e.message;
        this.log.log('error', msg);
        this.log.log('debug', e);
        throw new Error(msg);
    }
};

/**
 * Extracts and parses runtime config.
 * TODO: no negative path errors in case loadRuntimeConfig fails?
 *
 * @param {string} index - Path for index.html.
 * @private
 * @returns {null}
 */
AssetBundle.prototype._loadRuntimeConfig = function _loadRuntimeConfig(index) {
    var content;
    var matches;

    try {
        content = fs.readFileSync(index, 'UTF-8');
    } catch (e) {
        this.log.log('error', 'Error loading index file: ' + e.message);
        return null;
    }

    if (!this.matcher.test(content)) {
        this.log.log('error', 'Could not find runtime config in index file');
        return null;
    }

    try {
        matches = content.match(this.matcher);
        return JSON.parse(decodeURIComponent(matches[1]));
    } catch (e) {
        this.log.log('error', 'Could not find runtime config in index file');
        return null;
    }
};

/**
 * Adds an asset to own assets collection.
 *
 * @param {Asset} asset - Asset to add.
 * @private
 */
AssetBundle.prototype._addAsset = function _addAsset(asset) {
    this.ownAssetsByURLPath[asset.urlPath] = asset;
};

module.exports = AssetBundle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXV0b3VwZGF0ZS9hc3NldEJ1bmRsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0JBLElBQUksT0FBTyxRQUFRLE1BQVIsQ0FBWDtBQUNBLElBQUksS0FBSyxRQUFRLElBQVIsQ0FBVDtBQUNBLElBQUksTUFBTSxRQUFRLEtBQVIsQ0FBVjs7QUFFQSxJQUFJLE1BQU0sUUFBUSxVQUFSLENBQVY7QUFDQSxJQUFJLGdCQUFnQixRQUFRLGlCQUFSLENBQXBCOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFNBQVMsS0FBVCxDQUFlLFFBQWYsRUFBeUIsT0FBekIsRUFBa0MsUUFBbEMsRUFBNEMsU0FBNUMsRUFBdUQsSUFBdkQsRUFBNkQsZ0JBQTdELEVBQStFLElBQS9FLEVBQXFGLE1BQXJGLEVBQTZGO0FBQ3pGLFNBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsU0FBSyxnQkFBTCxHQUF3QixnQkFBeEI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkOztBQUVBLFNBQUssT0FBTCxHQUFlLFNBQVMsT0FBVCxHQUFtQjtBQUM5QixlQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssTUFBTCxDQUFZLFlBQXRCLEVBQW9DLFFBQXBDLENBQVA7QUFDSCxLQUZEO0FBR0g7Ozs7Ozs7Ozs7O0FBV0QsU0FBUyxXQUFULENBQXFCLENBQXJCLEVBQXdCLFlBQXhCLEVBQXNDLFFBQXRDLEVBQWdELGlCQUFoRCxFQUFtRTtBQUMvRCxRQUFJLE9BQU8sSUFBWDtBQUNBLFFBQUksU0FBSjs7QUFFQSxTQUFLLEVBQUwsR0FBVSxJQUFJLEdBQUosQ0FBUSxhQUFSLEVBQXVCLENBQXZC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LENBQVY7QUFDQSxlQUFPLEtBQUssS0FBTCxDQUFXLG1CQUFtQixRQUFRLENBQVIsQ0FBbkIsQ0FBWCxDQUFQO0FBQ0gsS0FIRCxDQUdFLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsYUFBSyxFQUFMLENBQVEsR0FBUixDQUFZLE9BQVosRUFBcUIsNkNBQXJCO0FBQ0EsZUFBTyxJQUFQO0FBQ0g7QUFDSixDQXZCRDs7Ozs7Ozs7QUErQkEsWUFBWSxTQUFaLENBQXNCLFNBQXRCLEdBQWtDLFNBQVMsU0FBVCxDQUFtQixLQUFuQixFQUEwQjtBQUN4RCxTQUFLLG1CQUFMLENBQXlCLE1BQU0sT0FBL0IsSUFBMEMsS0FBMUM7QUFDSCxDQUZEOztBQUlBLE9BQU8sT0FBUCxHQUFpQixXQUFqQiIsImZpbGUiOiJtb2R1bGVzL2F1dG91cGRhdGUvYXNzZXRCdW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuIFRoaXMgaXMgYSBzbGlnaHRseSBtb2RpZmllZCBKUyBwb3J0IG9mIGhvdCBjb2RlIHB1c2ggYW5kcm9pZCBjbGllbnQgZnJvbSBoZXJlOlxyXG4gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9jb3Jkb3ZhLXBsdWdpbi1tZXRlb3Itd2ViYXBwXHJcblxyXG4gVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcblxyXG4gQ29weXJpZ2h0IChjKSAyMDE1IE1ldGVvciBEZXZlbG9wbWVudCBHcm91cFxyXG5cclxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gU09GVFdBUkUuXHJcblxyXG4gVGhpcyBpcyBiYXNlZCBvbjpcclxuIC9jb3Jkb3ZhLXBsdWdpbi1tZXRlb3Itd2ViYXBwL2Jsb2IvbWFzdGVyL3NyYy9hbmRyb2lkL0Fzc2V0QnVuZGxlLmphdmFcclxuXHJcbiAqL1xyXG5cclxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XHJcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbnZhciB1cmwgPSByZXF1aXJlKCd1cmwnKTtcclxuXHJcbnZhciBMb2cgPSByZXF1aXJlKCcuL2xvZ2dlcicpO1xyXG52YXIgQXNzZXRNYW5pZmVzdCA9IHJlcXVpcmUoJy4vYXNzZXRNYW5pZmVzdCcpO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudCBzaW5nbGUgYXNzZXQgaW4gdGhlIGJ1bmRsZS5cclxuICpcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGZpbGVQYXRoXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmxQYXRoXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmaWxlVHlwZVxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gc2l6ZVxyXG4gKiBAcHJvcGVydHkge2Jvb2x9ICAgY2FjaGVhYmxlXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBoYXNoXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzb3VyY2VNYXBGaWxlUGF0aFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc291cmNlTWFwVXJsUGF0aFxyXG4gKiBAcHJvcGVydHkge0Fzc2V0QnVuZGxlfSBidW5kbGVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBBc3NldChmaWxlUGF0aCwgdXJsUGF0aCwgZmlsZVR5cGUsIGNhY2hlYWJsZSwgaGFzaCwgc291cmNlTWFwVXJsUGF0aCwgc2l6ZSwgYnVuZGxlKSB7XHJcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGg7XHJcbiAgICB0aGlzLnVybFBhdGggPSB1cmxQYXRoO1xyXG4gICAgdGhpcy5maWxlVHlwZSA9IGZpbGVUeXBlO1xyXG4gICAgdGhpcy5jYWNoZWFibGUgPSBjYWNoZWFibGU7XHJcbiAgICB0aGlzLmhhc2ggPSBoYXNoO1xyXG4gICAgdGhpcy5lbnRyeVNpemUgPSBzaXplO1xyXG4gICAgdGhpcy5zb3VyY2VNYXBVcmxQYXRoID0gc291cmNlTWFwVXJsUGF0aDtcclxuICAgIHRoaXMuYnVuZGxlID0gYnVuZGxlO1xyXG5cclxuICAgIHRoaXMuZ2V0RmlsZSA9IGZ1bmN0aW9uIGdldEZpbGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLmJ1bmRsZS5kaXJlY3RvcnlVcmksIGZpbGVQYXRoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGFzc2V0cyBidW5kbGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgbCAgICAgICAgICAgICAgICAgLSBMb2dnZXIgaW5zdGFuY2UuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgZGlyZWN0b3J5VXJpICAgICAgLSBXaGVyZSB0aGUgYnVuZGxlIGxpZXMgaW4gdGhlIGZpbGUgc3lzdGVtLlxyXG4gKiBAcGFyYW0ge0Fzc2V0TWFuaWZlc3Q9fSBtYW5pZmVzdCAgICAgICAgICAtIEJ1bmRsZSdzIG1hbmlmZXN0LlxyXG4gKiBAcGFyYW0ge0Fzc2V0QnVuZGxlPX0gICBwYXJlbnRBc3NldEJ1bmRsZSAtIFBhcmVudCBhc3NldCBidW5kbGUuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQXNzZXRCdW5kbGUobCwgZGlyZWN0b3J5VXJpLCBtYW5pZmVzdCwgcGFyZW50QXNzZXRCdW5kbGUpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBpbmRleEZpbGU7XHJcblxyXG4gICAgdGhpcy5fbCA9IG5ldyBMb2coJ0Fzc2V0QnVuZGxlJywgbCk7XHJcbiAgICB0aGlzLl9sLmxvZygnZGVidWcnLCAnQ3JlYXRpbmcgYnVuZGxlIG9iamVjdCBmb3IgJyArIGRpcmVjdG9yeVVyaSk7XHJcblxyXG4gICAgdGhpcy5kaXJlY3RvcnlVcmkgPSBkaXJlY3RvcnlVcmk7XHJcblxyXG4gICAgdGhpcy5fcnVudGltZUNvbmZpZyA9IG51bGw7XHJcbiAgICB0aGlzLl9hcHBJZCA9IG51bGw7XHJcbiAgICB0aGlzLl9yb290VXJsU3RyaW5nID0gbnVsbDtcclxuICAgIHRoaXMuX21hdGNoZXIgPSBuZXcgUmVnRXhwKFxyXG4gICAgICAgICdfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fID0gSlNPTi5wYXJzZVxcXFwoZGVjb2RlVVJJQ29tcG9uZW50XFxcXChcIihbXlwiXSopXCJcXFxcKVxcXFwpJ1xyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLl9wYXJlbnRBc3NldEJ1bmRsZSA9IHBhcmVudEFzc2V0QnVuZGxlO1xyXG5cclxuICAgIGlmIChtYW5pZmVzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fbC5sb2coJ2RlYnVnJywgJ0xvYWRpbmcgbXkgbWFuaWZlc3QgZnJvbSAnICsgZGlyZWN0b3J5VXJpKTtcclxuICAgICAgICB0aGlzLm1hbmlmZXN0ID0gdGhpcy5fbG9hZEFzc2V0TWFuaWZlc3QoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYW5pZmVzdCA9IG1hbmlmZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3ZlcnNpb24gPSB0aGlzLm1hbmlmZXN0LnZlcnNpb247XHJcbiAgICB0aGlzLmNvcmRvdmFDb21wYXRpYmlsaXR5VmVyc2lvbiA9IHRoaXMubWFuaWZlc3QuY29yZG92YUNvbXBhdGliaWxpdHlWZXJzaW9uO1xyXG5cclxuICAgIHRoaXMuX293bkFzc2V0c0J5VVJMUGF0aCA9IHt9O1xyXG5cclxuICAgIC8vIEZpbHRlciBhc3NldHMgdGhhdCBhcmUgb25seSBpbiB0aGlzIGJ1bmRsZS4gUmVzdCBjYW4gYmUgdGFrZW4gZnJvbSB0aGUgcGFyZW50LlxyXG4gICAgdGhpcy5tYW5pZmVzdC5lbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gZmlsdGVyRGlzdGluY3RBc3NldHMoZW50cnkpIHtcclxuICAgICAgICB2YXIgdXJsUGF0aCA9IHVybC5wYXJzZShlbnRyeS51cmxQYXRoKS5wYXRobmFtZTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudEFzc2V0QnVuZGxlID09PSB1bmRlZmluZWRcclxuICAgICAgICAgICAgfHwgcGFyZW50QXNzZXRCdW5kbGUuY2FjaGVkQXNzZXRGb3JVcmxQYXRoKHVybFBhdGgsIGVudHJ5Lmhhc2gpID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHNlbGYuX2FkZEFzc2V0KG5ldyBBc3NldChcclxuICAgICAgICAgICAgICAgIGVudHJ5LmZpbGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgdXJsUGF0aCxcclxuICAgICAgICAgICAgICAgIGVudHJ5LmZpbGVUeXBlLFxyXG4gICAgICAgICAgICAgICAgZW50cnkuY2FjaGVhYmxlLFxyXG4gICAgICAgICAgICAgICAgZW50cnkuaGFzaCxcclxuICAgICAgICAgICAgICAgIGVudHJ5LnNvdXJjZU1hcFVybFBhdGgsXHJcbiAgICAgICAgICAgICAgICBlbnRyeS5zaXplLFxyXG4gICAgICAgICAgICAgICAgc2VsZlxyXG4gICAgICAgICAgICApKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbnRyeS5zb3VyY2VNYXBGaWxlUGF0aCAhPT0gbnVsbCAmJiBlbnRyeS5zb3VyY2VNYXBVcmxQYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnRBc3NldEJ1bmRsZSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICB8fCBwYXJlbnRBc3NldEJ1bmRsZS5jYWNoZWRBc3NldEZvclVybFBhdGgoZW50cnkuc291cmNlTWFwVXJsUGF0aCwgbnVsbCkgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuX2FkZEFzc2V0KG5ldyBBc3NldChcclxuICAgICAgICAgICAgICAgICAgICBlbnRyeS5zb3VyY2VNYXBGaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICBlbnRyeS5zb3VyY2VNYXBVcmxQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICdqc29uJyxcclxuICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBlbnRyeS5zaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGZcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaW5kZXhGaWxlID0gbmV3IEFzc2V0KCdpbmRleC5odG1sJywgJy8nLCAnaHRtbCcsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIHRoaXMuX2FkZEFzc2V0KGluZGV4RmlsZSk7XHJcbiAgICB0aGlzLl9pbmRleEZpbGUgPSBpbmRleEZpbGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaXJlY3RvcnkgdXJpIGdldHRlci5cclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5nZXREaXJlY3RvcnlVcmkgPSBmdW5jdGlvbiBnZXREaXJlY3RvcnlVcmkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXJlY3RvcnlVcmk7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyZW50IGFzc2V0IGJ1bmRsZSBnZXR0ZXIuXHJcbiAqIEByZXR1cm5zIHtudWxsfEFzc2V0QnVuZGxlfVxyXG4gKi9cclxuQXNzZXRCdW5kbGUucHJvdG90eXBlLmdldFBhcmVudEFzc2V0QnVuZGxlID0gZnVuY3Rpb24gZ2V0UGFyZW50QXNzZXRCdW5kbGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50QXNzZXRCdW5kbGU7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gY2FjaGVhYmxlIG9yIGhhc2ggZXF1YWwgYXNzZXQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxQYXRoIC0gVGhlIHVybCBwYXRoIG9mIHRoZSBhc3NldC5cclxuICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gaGFzaCAgICAtIEhhc2ggb2YgdGhlIGFzc2V0LlxyXG4gKiBAcmV0dXJucyB7bnVsbHxBc3NldH1cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5jYWNoZWRBc3NldEZvclVybFBhdGggPSBmdW5jdGlvbiBjYWNoZWRBc3NldEZvclVybFBhdGgodXJsUGF0aCwgaGFzaCkge1xyXG4gICAgdmFyIGFzc2V0O1xyXG5cclxuICAgIGlmICghKHVybFBhdGggaW4gdGhpcy5fb3duQXNzZXRzQnlVUkxQYXRoKSkgcmV0dXJuIG51bGw7XHJcbiAgICBhc3NldCA9IHRoaXMuX293bkFzc2V0c0J5VVJMUGF0aFt1cmxQYXRoXTtcclxuXHJcbiAgICAvLyBJZiB0aGUgYXNzZXQgaXMgbm90IGNhY2hlYWJsZSwgd2UgcmVxdWlyZSBhIG1hdGNoaW5nIGhhc2guXHJcbiAgICBpZiAoKGFzc2V0LmNhY2hlYWJsZSAmJiBoYXNoID09PSBudWxsKSB8fCAoYXNzZXQuaGFzaCAhPT0gbnVsbCAmJiBhc3NldC5oYXNoID09PSBoYXNoKSkge1xyXG4gICAgICAgIHJldHVybiBhc3NldDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG93biBhc3NldHMuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtBcnJheX1cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5nZXRPd25Bc3NldHMgPSBmdW5jdGlvbiBnZXRPd25Bc3NldHMoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fb3duQXNzZXRzQnlVUkxQYXRoKVxyXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24gcmVkdWNlS2V5cyhhcnIsIGtleSkge1xyXG4gICAgICAgICAgICBhcnIucHVzaChzZWxmLl9vd25Bc3NldHNCeVVSTFBhdGhba2V5XSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnI7XHJcbiAgICAgICAgfSwgW10pO1xyXG59O1xyXG4vKipcclxuICogVmVyc2lvbiBnZXR0ZXIuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5Bc3NldEJ1bmRsZS5wcm90b3R5cGUuZ2V0VmVyc2lvbiA9IGZ1bmN0aW9uIGdldFZlcnNpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdmVyc2lvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBMb2FkcyBydW50aW1lIGNvbmZpZy5cclxuICpcclxuICogQHJldHVybnMge09iamVjdH1cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5nZXRSdW50aW1lQ29uZmlnID0gZnVuY3Rpb24gZ2V0UnVudGltZUNvbmZpZygpIHtcclxuICAgIGlmICh0aGlzLl9ydW50aW1lQ29uZmlnID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fcnVudGltZUNvbmZpZyA9IHRoaXMuX2xvYWRSdW50aW1lQ29uZmlnKFxyXG4gICAgICAgICAgICBwYXRoLmpvaW4odGhpcy5kaXJlY3RvcnlVcmksIHRoaXMuX2luZGV4RmlsZS5maWxlUGF0aClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3J1bnRpbWVDb25maWc7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwIGlkIGdldHRlci5cclxuICpcclxuICogQHJldHVybnMge1N0cmluZ31cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5nZXRBcHBJZCA9IGZ1bmN0aW9uIGdldEFwcElkKCkge1xyXG4gICAgdmFyIHJ1bnRpbWVDb25maWc7XHJcbiAgICBpZiAodGhpcy5fYXBwSWQgPT09IG51bGwpIHtcclxuICAgICAgICBydW50aW1lQ29uZmlnID0gdGhpcy5nZXRSdW50aW1lQ29uZmlnKCk7XHJcbiAgICAgICAgaWYgKHJ1bnRpbWVDb25maWcgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKCEoJ2FwcElkJyBpbiBydW50aW1lQ29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbC5sb2coJ2Vycm9yJywgJ0Vycm9yIHJlYWRpbmcgQVBQX0lEIGZyb20gcnVudGltZSBjb25maWcnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FwcElkID0gcnVudGltZUNvbmZpZy5hcHBJZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9hcHBJZDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gUk9PVF9VUkwgZnJvbSBydW50aW1lIGNvbmZpZy5cclxuICpcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5nZXRSb290VXJsU3RyaW5nID0gZnVuY3Rpb24gZ2V0Um9vdFVybFN0cmluZygpIHtcclxuICAgIHZhciBydW50aW1lQ29uZmlnO1xyXG4gICAgaWYgKHRoaXMuX3Jvb3RVcmxTdHJpbmcgPT09IG51bGwpIHtcclxuICAgICAgICBydW50aW1lQ29uZmlnID0gdGhpcy5nZXRSdW50aW1lQ29uZmlnKCk7XHJcbiAgICAgICAgaWYgKHJ1bnRpbWVDb25maWcgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKCEoJ1JPT1RfVVJMJyBpbiBydW50aW1lQ29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbC5sb2coJ2Vycm9yJywgJ0Vycm9yIHJlYWRpbmcgUk9PVF9VUkwgZnJvbSBydW50aW1lIGNvbmZpZycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcm9vdFVybFN0cmluZyA9IHJ1bnRpbWVDb25maWcuUk9PVF9VUkw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fcm9vdFVybFN0cmluZztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2VzIGJ1bmRsZXMgZGlyZWN0b3J5IHVyaS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdG9yeVVyaSAtIE5ldyBkaXJlY3RvcnkgcGF0aC5cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5kaWRNb3ZlVG9EaXJlY3RvcnlBdFVyaSA9IGZ1bmN0aW9uIGRpZE1vdmVUb0RpcmVjdG9yeUF0VXJpKGRpcmVjdG9yeVVyaSkge1xyXG4gICAgdGhpcy5kaXJlY3RvcnlVcmkgPSBkaXJlY3RvcnlVcmk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhc3NldCBxdWVyaWVkIGJ5IHVybCBwYXRoLlxyXG4gKiAhVU5VU0VEISBMZWZ0IGluIGNhc2Ugb2YgaW1wbGVtZW50YXRpb24gY2hhbmdlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsUGF0aCAtIFVybCBwYXRoIG9mIHRoZSBhc3NldC5cclxuICpcclxuICogQHJldHVybnMge0Fzc2V0fVxyXG4gKi9cclxuQXNzZXRCdW5kbGUucHJvdG90eXBlLl9hc3NldEZvclVybFBhdGggPSBmdW5jdGlvbiBfYXNzZXRGb3JVcmxQYXRoKHVybFBhdGgpIHtcclxuICAgIHZhciBhc3NldDtcclxuXHJcbiAgICBpZiAodXJsUGF0aCBpbiB0aGlzLl9vd25Bc3NldHNCeVVSTFBhdGgpIHtcclxuICAgICAgICBhc3NldCA9IHRoaXMuX293bkFzc2V0c0J5VVJMUGF0aFt1cmxQYXRoXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3BhcmVudEFzc2V0QnVuZGxlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGFzc2V0ID0gdGhpcy5fcGFyZW50QXNzZXRCdW5kbGUuX2Fzc2V0Rm9yVXJsUGF0aCh1cmxQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXNzZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogTG9hZCB0aGlzIGJ1bmRsZSdzIGFzc2V0IG1hbmlmZXN0LlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcmV0dXJucyB7QXNzZXRNYW5pZmVzdH1cclxuICovXHJcbkFzc2V0QnVuZGxlLnByb3RvdHlwZS5fbG9hZEFzc2V0TWFuaWZlc3QgPSBmdW5jdGlvbiBfbG9hZEFzc2V0TWFuaWZlc3QoKSB7XHJcbiAgICB2YXIgbXNnO1xyXG4gICAgdmFyIG1hbmlmZXN0UGF0aCA9IHBhdGguam9pbih0aGlzLmRpcmVjdG9yeVVyaSwgJ3Byb2dyYW0uanNvbicpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gbmV3IEFzc2V0TWFuaWZlc3QoXHJcbiAgICAgICAgICAgIHRoaXMuX2wuZ2V0VW53cmFwcGVkTG9nZ2VyKCksXHJcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhtYW5pZmVzdFBhdGgsICdVVEYtOCcpXHJcbiAgICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBtc2cgPSAnRXJyb3IgbG9hZGluZyBhc3NldCBtYW5pZmVzdDogJyArIGUubWVzc2FnZTtcclxuICAgICAgICB0aGlzLl9sLmxvZygnZXJyb3InLCBtc2cpO1xyXG4gICAgICAgIHRoaXMuX2wubG9nKCdkZWJ1ZycsIGUpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3RzIGFuZCBwYXJzZXMgcnVudGltZSBjb25maWcuXHJcbiAqIFRPRE86IG5vIG5lZ2F0aXZlIHBhdGggZXJyb3JzIGluIGNhc2UgbG9hZFJ1bnRpbWVDb25maWcgZmFpbHM/XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbmRleCAtIFBhdGggZm9yIGluZGV4Lmh0bWwuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEByZXR1cm5zIHtudWxsfVxyXG4gKi9cclxuQXNzZXRCdW5kbGUucHJvdG90eXBlLl9sb2FkUnVudGltZUNvbmZpZyA9IGZ1bmN0aW9uIF9sb2FkUnVudGltZUNvbmZpZyhpbmRleCkge1xyXG4gICAgdmFyIGNvbnRlbnQ7XHJcbiAgICB2YXIgbWF0Y2hlcztcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaW5kZXgsICdVVEYtOCcpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHRoaXMuX2wubG9nKCdlcnJvcicsICdFcnJvciBsb2FkaW5nIGluZGV4IGZpbGU6ICcgKyBlLm1lc3NhZ2UpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fbWF0Y2hlci50ZXN0KGNvbnRlbnQpKSB7XHJcbiAgICAgICAgdGhpcy5fbC5sb2coJ2Vycm9yJywgJ0NvdWxkIG5vdCBmaW5kIHJ1bnRpbWUgY29uZmlnIGluIGluZGV4IGZpbGUnKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIG1hdGNoZXMgPSBjb250ZW50Lm1hdGNoKHRoaXMuX21hdGNoZXIpO1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgdGhpcy5fbC5sb2coJ2Vycm9yJywgJ0NvdWxkIG5vdCBmaW5kIHJ1bnRpbWUgY29uZmlnIGluIGluZGV4IGZpbGUnKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIGFuIGFzc2V0IHRvIG93biBhc3NldHMgY29sbGVjdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtBc3NldH0gYXNzZXQgLSBBc3NldCB0byBhZGQuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Bc3NldEJ1bmRsZS5wcm90b3R5cGUuX2FkZEFzc2V0ID0gZnVuY3Rpb24gX2FkZEFzc2V0KGFzc2V0KSB7XHJcbiAgICB0aGlzLl9vd25Bc3NldHNCeVVSTFBhdGhbYXNzZXQudXJsUGF0aF0gPSBhc3NldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXNzZXRCdW5kbGU7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
