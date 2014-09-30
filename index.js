var through = require('through2'),
    gutil = require('gulp-util'),
    ExecBuffer = require('exec-buffer'),
    kss = require('kss').path;

// consts
const PLUGIN_NAME = 'gulp-zebrakss';

// plugin level function (dealing with files)
function gulpZebraKSS(options) {
    options = options || {};

    var exec = new ExecBuffer(),
        args = [exec.src()];

    if (options.template) {
        args.push('--template', options.template);
    }

    if (options.preprocessor) {
        args.push('--' + options.preprocessor);
    }

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        exec.use(kss, args)
            .run(file.contents, function (err, buf) {
                if (err) {
                    cb(new gutil.PluginError(PLUGIN_NAME, err, {
                        fileName: file.path
                    }));
                    return;
                }

                file.contents = buf;
                cb(null, file);
            });
    });
}

// exporting the plugin main function
module.exports = gulpZebraKSS;