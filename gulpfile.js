'use strict';

var gulp = require('gulp'),
    webpack = require('webpack'),
    del = require('del');

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('bundle', function(cb) {
  webpack({
    target: 'web',
    bail: true,
    entry: {
      main: './main.js'
    },
    output: {
      path: '/Users/shawt/NetBeansProjects/iForge_ch_plugin/build/',
      filename: '[name].bundle.js'
    }
    //module: {
      //loaders: [
        //{ test: /main\.js$/, loader: "transform?brfs" }
      //]
    //}
  }, cb);
});

gulp.task('copy', function() {
  return gulp.src(['./manifest.json', 'index.html', 'index.js'])
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['bundle', 'copy']);