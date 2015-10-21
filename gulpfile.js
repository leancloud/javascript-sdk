var path = require('path');
var qiniu = require('qiniu');
var fs = require('fs');
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
var source = require('vinyl-source-stream');
var browserify = require('browserify');


getAVVersion = function() {
  return require('./lib/AV.js').AV.VERSION.replace('js', '');
};

gulp.task('pack', shell.task([
  "rm -rf ./dist/",
  'rm -rf avos-javascript-sd',
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
  };
}

function uploadCDN(file, version, cb) {
   qiniu.conf.ACCESS_KEY = process.env['CDN_QINIU_KEY'];
   qiniu.conf.SECRET_KEY = process.env['CDN_QINIU_SECRET'];
   var bucketname = 'paas_files';
   var key = 'static/js/' + path.basename(file, '.js') + '-' +
       version + '.js';

   var putPolicy = new qiniu.rs.PutPolicy(bucketname + ':' + key);
   var uptoken = putPolicy.token();
   var extra = new qiniu.io.PutExtra();
   extra.mimeType = 'application/javascript';
   var buffer = fs.readFileSync(file);
   qiniu.io.put(uptoken, key, buffer, extra, function(err, ret) {
     if (!err) {
        console.log('https://cdn1.lncld.net/' + ret.key);
      } else {
        console.log(err);
      }
      cb();
   });
}

gulp.task('browserify', function() {
  var bundle = browserify({entries: './lib/av-browser.js'});
  return bundle.bundle()
    .pipe(source('av.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('browserify-core', function() {
  var bundle = browserify({entries: './lib/av-browser-core.js'});
  return bundle.bundle()
    .pipe(source('av-core.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['browserify', 'browserify-core'], function() {
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
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc lib/',
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
      'role.js',
      'master_key.js',
      'status.js',
      'sms.js',
      'search.js',
      'insight.js',
      'bigquery.js'
    ]))
    .pipe(mocha({
      timeout: 100000,
    }));
});

gulp.task('clean', function() {
  gulp.src(['dist/'])
    .pipe(clean({force: true}));
});

gulp.task('upload', ['compress-scripts'], function(cb) {
   uploadCDN('./dist/av-mini.js', getAVVersion(), function(){
     uploadCDN('./dist/av-core-mini.js', getAVVersion(), cb);
   });
});


gulp.task('release', [
  'browserify',
  'uglify',
  'compress-scripts',
  'docs',
  'compress-docs'
]);
