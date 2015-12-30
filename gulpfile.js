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
gulp.task('minify', function() {
    return gulp.src('src/*.js')
        .pipe(ngmin({dynamic: false}))
        .pipe(stripDebug())
        .pipe(uglify({outSourceMap: false, mangle: true}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('help',function () {

    console.log('	gulp build			文件打包');

    console.log('	gulp watch			文件监控打包');

    console.log('	gulp help			gulp参数说明');

    console.log('	gulp server			测试server');

    console.log('	gulp -p				生产环境（默认生产环境）');

    console.log('	gulp -d				开发环境');

    console.log('	gulp -m <module>		部分模块打包（默认全部打包）');

});

/* 默认 */

gulp.task('default',function () {

    gulp.start('help');

});