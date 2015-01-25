var gulp = require('gulp');
var gzip = require('gulp-gzip');
var jsdoc = require("gulp-jsdoc");
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var tar = require('gulp-tar');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');

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

gulp.task('scripts', function() {
  return gulp.src('lib/av.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('av-mini.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress-scripts', ['scripts'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/av.js', 'dist/av-mini.js'])
    .pipe(tar('avos-javascript-sdk-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

// gulp.task('docs', function() {
//   gulp.src('lib/av_merged.js')
//   .pipe(jsdoc('./dist/js-sdk-api-docs'));
// });

gulp.task('docs', shell.task([
  'mkdir -p dist/js-sdk-api-docs',
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc lib/av_merged.js',
]));

gulp.task('compress-docs', ['docs'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/js-sdk-api-docs/**'])
    .pipe(tar('js-sdk-api-docs-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
})

gulp.task('clean', function() {
  gulp.src(['dist/'])
    .pipe(clean({force: true}));
});

gulp.task('release', ['compress-scripts', 'compress-docs']);
