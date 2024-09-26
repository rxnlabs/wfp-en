'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var path = require('path');
var watchify = require('watchify');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps')

// PostCSS Processors
var processors = [
    require('postcss-short')({ /* options */ }),
    require('postcss-sorting')({ /* options */ }),
    require('postcss-pxtorem')({replace: false}),
    require('autoprefixer')({ browsers: ['last 3 versions', 'ios 8'] })
];

// Compile Styles for Dev
function styles() {
    return gulp.src([ './_src/scss/en-cshp.scss', './_src/scss/overrides_cobranded.scss', './_src/scss/overrides_lovesong-c4.scss', './_src/scss/overrides_ett-sidebar.scss', './_src/scss/overrides_action-donate.scss', './_src/scss/overrides_multistep.scss' ])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./maps', {includeContent: false, sourceRoot: '/_src/scss'}))
        .pipe(gulp.dest('./dist/css/'));
}
// Compile Scripts for Dev
function scripts() {
    return browserify('./_src/js/en-cshp.js')
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('en-cshp.js'))
        .pipe(gulp.dest('./dist/js/'));
}

// Watch Task
function watch() {
    gulp.watch(['./_src/scss/**/*.scss'], styles);
    gulp.watch(['./_src/js/**/*.js'], scripts);

}

var dev = gulp.series(styles, scripts, watch);


gulp.task('default', dev);