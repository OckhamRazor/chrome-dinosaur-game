/**
 * Created by baobaobao on 2016/7/23.
 */
var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

/**
 * 检查JS文件
 * lint任务会检查 js/ 目录下的有无报错或警告
 */
gulp.task('lint',function () {
    gulp.src('./js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/**
 * 合并，重命名，压缩文件JS文件
 * scripts任务会合并 js/ 目录下所有的js文件并输出到 dist/ 目录
 */
gulp.task('scripts', function () {
    gulp.src('./js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

/**
 *  .run()方法关联和运行我们上面定义的任务
 *  .watch() 方法监听指定目录的文件变化，当有文件变化时运行回调定义的其他任务
 */
gulp.task('default', function () {
    gulp.run('lint','scripts');
    gulp.watch('.js/*.js',function () {
        gulp.run('lint','scripts');
    });
});





