const path = require('path');
const fs = require('fs');
const download = require('download');
const crypto = require("crypto");

module.exports = function (options) {
    let doApply = function (options, resolver) {
        resolver.getHook("before-resolve")
            .tapAsync("RemoteWebpackPlugin", (request, resolveContext, callback) => {
                if (!/^(?:\w+:)?\/\/(\S+)$/.test(request.request)) {
                    return callback();
                }

                let filename = crypto.createHash('md5').update(request.request).digest('hex') + path.extname(request.request);
                let newRequest = path.resolve(path.join('.', 'node_modules', '.cache', 'remote-webpack-plugin', filename));

                if (fs.existsSync(path)) {
                    request.request = newRequest;
                    return callback();
                } else {
                    download(request.request, path.dirname(newRequest), {
                        filename
                    }).then(() => {
                        request.request = newRequest;
                        return callback();
                    });
                }
            })
    }
    return {
        apply: doApply.bind(this, options)
    };
}