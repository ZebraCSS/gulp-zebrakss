'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    dust = require('catberry-dust'),
    kss = require('kss');

// consts
const PLUGIN_NAME = 'gulp-zebrakss';

// plugin level function (dealing with files)
function gulpZebraKSS(options) {
    options = options || {};
    options.template = options.template || path.join(__dirname, 'lib', 'template', 'index.dust');

    var buffer = [],
        firstFile = null;

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        if (!firstFile) {
            firstFile = file;
        }

        buffer.push(file.contents.toString('utf8'));
    }, function (cb) {
        if (!firstFile) {
            cb();
            return;
        }

        kss.parse(buffer, options.kssOptions, function (err, stylegude) {
            if (err) {
                cb(err);
                return;
            }

            console.log(stylegude);

            cb();
        });
    });
}

// exporting the plugin main function
module.exports = gulpZebraKSS;