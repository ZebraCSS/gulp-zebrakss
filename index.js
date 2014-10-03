'use strict';

var through = require('through2'),
	gutil = require('gulp-util'),
	path = require('path'),
	Promise = require('promise'),
	Dust = require('catberry-dust').Dust,
	kss = require('kss'),
	map = require('map-stream'),
	vinyl = require('vinyl-fs'),
	fs = require('fs');

global.Promise = Promise;

// consts
var PLUGIN_NAME = 'gulp-zebrakss';

// plugin level function (dealing with files)
function gulpZebraKSS(options) {
	options = options || {};
	options.kssOptions = options.kssOptions || {};
	options.styleFile = options.styleFile || 'style.css';
	options.templateDirectory =
		options.templateDirectory ||
		path.join(__dirname, 'lib', 'template');
	options.brand = options.brand || 'ZebraCSS';
	options.overview = options.overview || path.join(__dirname, 'lib', 'template', 'overview.md');

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

		var self = this;

		vinyl.src([path.join(options.templateDirectory, '**', '*.*')])
			.pipe(map(function (file, callback) {
				processFilesFromTemplate(file, options, buffer,
					function (error, compiledFile) {
						self.push(compiledFile);
						callback(null, compiledFile);
					}
				);
			}))
			.on('end', function () {
				cb();
			});
	});
}

/**
 * Process files from template directory
 * @param {Object} file
 * @param {Object} options
 * @param {Array} buffer
 * @param {Function} callback
 */
function processFilesFromTemplate (file, options, buffer, callback) {
	if (path.basename(file.path) !== 'index.html') {
		callback(null, file);
		return;
	}

	parseCSSDocs(file, options, buffer, callback);
}

/**
 * Parse CSS docs with KSS
 */
function parseCSSDocs(file, options, buffer, callback) {
	var dust = new Dust(),
		templateName = 'styleguideTemplate',
		template = file.contents.toString(),
		compiledTemplate = dust.templateManager.compile(template);

	dust.templateManager.registerCompiled(templateName, compiledTemplate);

	kss.parse(buffer, options.kssOptions, function (kssError, styleguide) {
		if (kssError) {
			callback(kssError);
			return;
		}

		var dc = prepareStyleGuide(styleguide);
		dc.styleFile = options.styleFile;
		dc.brand = options.brand;

		if (options.overview) {
			dc.overview = fs.readFileSync(options.overview);
		}

		dust.render(templateName, dc)
			.then(function (content) {
				file.contents = new Buffer(content);
				callback(null, file);
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
					alias: 'section-' + section.reference().replace('.', '-'),
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