'use strict';

var through = require('through2'),
	gutil = require('gulp-util'),
	path = require('path'),
	Promise = require('promise'),
	Dust = require('catberry-dust').Dust,
	kss = require('kss'),
	fsExtra = require('fs-extra'),
	fs = require('fs');

global.Promise = Promise;

// consts
var PLUGIN_NAME = 'gulp-zebrakss';

// plugin level function (dealing with files)
function gulpZebraKSS(options) {
	options = options || {};
	options.kssOptions = options.kssOptions || {};
	options.styleGuideName = options.styleGuideName || 'styleguide';
	options.styleFileName = options.styleFileName || 'style.css';
	options.templateDirectory =
		options.templateDirectory ||
		path.join(__dirname, 'lib', 'template');

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
		cb();

	}, function (cb) {
		if (!firstFile) {
			cb();
			return;
		}

		options.destDirectory =
			path.join(options.destDirectory, options.styleGuideName) ||
			path.join(firstFile.base, options.styleGuideName);

		fsExtra.copy(
			options.templateDirectory,
			options.destDirectory,
			function (err) {
				if (err) {
					cb(new gutil.PluginError(PLUGIN_NAME, err));
					return;
				}

				parseCSSDocs(buffer, options, function (error) {
					cb(new gutil.PluginError(PLUGIN_NAME, error));
				});
			});
	});
}

/**
 * Parse CSS docs with KSS
 * @param {Array} buffer
 * @param {Object} options
 * @param {Function} callback
 */
function parseCSSDocs(buffer, options, callback) {
	var dust = new Dust(),
		templateName = 'styleguideTemplate',
		index = path.join(options.destDirectory, 'index.html'),
		template = fs.readFileSync(index, 'utf-8'),
		compiledTemplate = dust.templateManager.compile(template);

	dust.templateManager.registerCompiled(templateName, compiledTemplate);

	kss.parse(buffer, options.kssOptions, function (kssError, styleguide) {
		if (kssError) {
			callback(kssError);
			return;
		}

		var dc = prepareStyleGuide(styleguide);
		dc.styleFileName = options.styleFileName;

		dust.render(templateName, dc)
			.then(function (content) {
				fs.writeFileSync(index, content);
				callback();
			}, function (dustError) {
				callback(dustError);
			});
	});
}

/**
 * Use KSS Module API
 * @param {KSSStyleGuide} kssStyleGuide
 * @returns {{styleguide: {sections: *}}}
 */
function prepareStyleGuide(kssStyleGuide) {
	return {
		styleguide: {
			sections: kssStyleGuide.section().map(function (section) {
				return {
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
				};
			})
		}
	};
}

// exporting the plugin main function
module.exports = gulpZebraKSS;