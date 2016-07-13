/**
 * Created by fengjj on 2016/7/12.
 */
'use strict';
let gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon');
gulp.task('watch',() => {
    gulp.watch('routes/*.*',(file) => {
        livereload.changed(file);
    })
});
gulp.task('serve',() => {
    nodemon({
        script:'app.js',
        ext: 'js html jade',
        tasks:['watch']
    }).on('readable',() => {

    });
});

