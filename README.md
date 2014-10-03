# gulp-zebrakss

Gulp plugin for KSS ([Knyle Stype Sheets](http://warpspire.com/kss/)) documentation generation.

This plugin is based on [kss-node](https://github.com/hughsk/kss-node) and generates a styleguide based on code documentation.

[ZebraKSS Demo](http://zebracss.github.io/gulp-zebrakss/)

Example:

```js
'use strict';

var gulp = require('gulp'),
	rename = require('gulp-rename'),
	less = require('gulp-less'),
	zebrakss = require('gulp-zebrakss'),
	path = require('path');

var styleName = 'zebra.css',
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
			// overview: path.join('.', 'lib', 'template', 'overview.md')
			// templateDirectory: path.join('.', 'lib', 'template')
			// brand: 'ZebraCSS'
		}))
		.pipe(gulp.dest(path.join(destinationDirectory, 'styleguide')));
});

gulp.task('build', ['publish-your-site', 'generate-style-guide']);
gulp.task('default', ['build']);
```

Example will generate styleguide in ``./build/styleguide/`` and referenced to ``./build/zebra.css``.