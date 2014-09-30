# gulp-zebrakss

Gulp plugin for KSS ([Knyle Stype Sheets](http://warpspire.com/kss/)) documentation generation.

This plugin is based on [kss-node](https://github.com/hughsk/kss-node) and generates a styleguide based on code documentation.

**Plugin isn't ready**

Example:

```js
var gulp = require('gulp'),
    zebrakss = require('gulp-zebrakss'),
    path = require('path');

gulp.task('styleguide', function () {
    gulp.src(path.join('.', 'zebra.less'))
        .pipe(zebrakss({
            styleFileName: 'zebra',
            destDirectory: path.join(__dirname, '.', 'build')
        }));
});
```

Example will generate styleguide in ``./build/styleguide/`` and referenced to ``./build/zebra.css``.