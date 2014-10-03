'use strict';

var gulp = require('gulp'),
	rename = require('gulp-rename'),
	less = require('gulp-less'),
	csslint = require('gulp-csslint'),
	zebrakss = require('./'),
	browserSync = require('browser-sync'),
	path = require('path');

var styleName = 'zebra.css',
	//sourceStyles = path.join('.', 'lib', 'template', 'assets', 'style.css'),
	sourceStyles = path.join('.', 'test', 'demo', 'index.less'),
	destinationDirectory = path.join('.', 'build');

// publish your site as usual
gulp.task('publish-your-site', function () {
	gulp.src(sourceStyles)
		.pipe(less())
		.pipe(rename(styleName))
		.pipe(gulp.dest(destinationDirectory));
});

// generate style guide that referenced to your public style file
gulp.task('generate-style-guide', function () {
	gulp.src(sourceStyles)
		.pipe(less())
		.pipe(zebrakss({
			kssOptions: {
				//mask: '*.less',
				//markdown: true,
				//multiline: true
			},
			styleFile: styleName
		}))
		.pipe(gulp.dest(path.join(destinationDirectory, 'styleguide')))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// test css
gulp.task('test', function () {
	gulp.src(path.join('.', 'lib', 'template', 'assets', 'style.css'))
		.pipe(less())
		.pipe(csslint({
			// https://github.com/CSSLint/csslint/wiki/Rules-by-ID
			'box-sizing': false,
			'fallback-colors': false
		}))
		.pipe(csslint.reporter());
});

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: './build/'
		}
	});
});

gulp.task('server', ['generate-style-guide', 'browser-sync'], function () {
	gulp.watch(
		path.join('.', 'lib', 'template', '**', '*.*'),
		['generate-style-guide']
	);
	gulp.watch(path.join('.', 'index.js'), ['generate-style-guide']);
});

gulp.task('build', ['publish-your-site', 'generate-style-guide']);
gulp.task('default', ['build']);