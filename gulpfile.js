var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require("gulp-concat");
var gzip = require('gulp-gzip');
var mocha = require('gulp-mocha');
var jsdoc = require("gulp-jsdoc");
var order = require("gulp-order");
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var tar = require('gulp-tar');
var uglify = require('gulp-uglify');
var order = require('gulp-order');

var coreSources = [
  'version.js',
  'underscore.js',
  'utils.js',
  'error.js',
  'event.js',
  'geopoint.js',
  'acl.js',
  'op.js',
  'relation.js',
  'promise.js',
  'file.js',
  'object.js',
  'role.js',
  'user.js',
  'query.js',
  'cloudfunction.js',
  'push.js',
  'status.js',
  'search.js'
];

var optionalSources = [
  'facebook.js',
  'history.js',
  'router.js',
  'collection.js',
  'view.js'
]


getAVVersion = function() {
  return require('./lib/AV.js').AV.VERSION.replace('js', '');
};

gulp.task('pack', shell.task([
  'rm -rf dist/',
  'rm -rf node_modules/',
  'rm -rf ./*.tgz',
  'rm -rf ./tools',
  'npm pack',
  'git checkout -- ./',
]));

function concatGenerator(sources, file) {
  return function() {
    return gulp.src(sources.map(function(filename) { return path.join('lib', filename); }))
      .pipe(order(sources))
      .pipe(concat(file))
      .pipe(gulp.dest('dist'));
  }
}

gulp.task('concat', concatGenerator(coreSources.concat(optionalSources), 'av.js'));
gulp.task('concat_core', concatGenerator(coreSources, 'av-core.js'));

gulp.task('uglify', ['concat'], function() {
  gulp.src('dist/av-core.js')
    .pipe(uglify())
    .pipe(rename('av-core-mini.js'))
    .pipe(gulp.dest('dist'));
  return gulp.src('dist/av.js')
    .pipe(uglify())
    .pipe(rename('av-mini.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress-scripts', ['uglify'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/av.js', 'dist/av-mini.js', 'dist/av-core-mini.js', 'dist/av-core.js', 'readme.txt'])
    .pipe(tar('avos-javascript-sdk-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', shell.task([
  'mkdir -p dist/js-sdk-api-docs',
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc dist/av.js lib/cloud.js',
]));

gulp.task('compress-docs', ['docs'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/js-sdk-api-docs/**'])
    .pipe(tar('js-sdk-api-docs-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  return gulp.src('test/*.js', {read: false})
    .pipe(order([
      'test.js',
      'file.js',
      'error.js',
      'object.js',
      'collection.js',
      'user.js',
      'query.js',
      'geopoint.js',
      'acl.js',
      'master_key.js',
      'status.js',
      'sms.js',
      'search.js'
    ]))
    .pipe(mocha({
      timeout: 100000,
    }));
});

gulp.task('clean', function() {
  gulp.src(['dist/'])
    .pipe(clean({force: true}));
});

gulp.task('release', ['concat', 'concat_core', 'uglify', 'compress-scripts', 'docs', 'compress-docs']);
