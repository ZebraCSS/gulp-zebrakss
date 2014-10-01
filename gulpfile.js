'use strict';

var gulp = require('gulp'),
	rename = require('gulp-rename'),
	less = require('gulp-less'),
	zebrakss = require('./'),
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
			styleFileName: styleName,
			destDirectory: path.join(__dirname, destinationDirectory)
		}));
});

gulp.task('build', ['publish-your-site', 'generate-style-guide']);
gulp.task('default', ['build']);