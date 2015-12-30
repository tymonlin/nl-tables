/**
 * Created by linchunhui on 15/12/30.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var ngmin = require('gulp-ngmin');
var stripDebug = require('gulp-strip-debug');
gulp.task('build', function() {
    return gulp.src('src/*.js')
        .pipe(ngmin({dynamic: false}))
        .pipe(stripDebug())
        .pipe(uglify({outSourceMap: false, mangle: true}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/'))
});