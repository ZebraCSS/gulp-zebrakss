'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    Promise = require('promise'),
    Dust = require('catberry-dust').Dust,
    kss = require('kss'),
    fs = require('fs');

global.Promise = Promise;

// consts
var PLUGIN_NAME = 'gulp-zebrakss';

// plugin level function (dealing with files)
function gulpZebraKSS(options) {
    options = options || {};
    options.kssOptions = options.kssOptions || {};
    options.template = options.template || path.join(__dirname, 'lib', 'template', 'index.dust');

    var buffer = [],
        firstFile = null,
        dust = new Dust();

    var templateName = 'styleguideTemplate',
        template = fs.readFileSync(options.template, 'utf-8'),
        compiledTemplate = dust.templateManager.compile(template);

    dust.templateManager.registerCompiled(templateName, compiledTemplate);

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

        cb();
    }, function (cb) {
        if (!firstFile) {
            cb();
            return;
        }

        var self = this;

        kss.parse(buffer, options.kssOptions, function (err, styleguide) {
            if (err) {
                cb(err);
                return;
            }

            dust.render(templateName, reformatStyleguide(styleguide))
                .then(function (content) {
                    self.push(new gutil.File({
                        cwd: firstFile.cwd,
                        base: firstFile.base,
                        path: path.join(firstFile.base, 'styleguide.html'),
                        contents: new Buffer(content)
                    }));

                    cb();
                }, function (error) {
                    cb(new gutil.PluginError(PLUGIN_NAME, error));
                });
        });
    });
}

function reformatStyleguide (styleguide) {
    var dcFromStyleguide = [];
    styleguide.section().forEach(function (section) {
        dcFromStyleguide.push({
            reference: section.reference(),
            header: section.header(),
            markup: section.markup(),
            description: section.description(),
            isDeprecated: section.deprecated(),
            isExperimental: section.experimental(),
            modifiers: section.modifiers().map(function (modifier) {
                return {
                    name: modifier.name(),
                    description: modifier.description(),
                    className: modifier.className(),
                    markup: modifier.markup()
                };
            })
        });
    });

    return {
        styleguide: {
            sections: dcFromStyleguide
        }
    };
}

// exporting the plugin main function
module.exports = gulpZebraKSS;