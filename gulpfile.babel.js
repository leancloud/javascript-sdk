/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

import path from 'path';
import qiniu from 'qiniu';
import fs from 'fs';
import gulp from 'gulp';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import gzip from 'gulp-gzip';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import rename from 'gulp-rename';
import shell from 'gulp-shell';
import tar from 'gulp-tar';
import uglify from 'gulp-uglify';
import order from 'gulp-order';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import lc from './src/av';

const reload = browserSync.reload;

// 获取当前版本号
const getAVVersion = () => {
  return lc.version.replace('js', '');
};

const uploadCDN = (file, version, cb) => {
  qiniu.conf.ACCESS_KEY = process.env.CDN_QINIU_KEY;
  qiniu.conf.SECRET_KEY = process.env.CDN_QINIU_SECRET;
  const bucketname = 'paas_files';
  const key = 'static/js/' + path.basename(file, '.js') + '-' + version + '.js';
  const putPolicy = new qiniu.rs.PutPolicy(bucketname + ':' + key);
  const uptoken = putPolicy.token();
  const extra = new qiniu.io.PutExtra();
  extra.mimeType = 'application/javascript';
  const buffer = fs.readFileSync(file);
  qiniu.io.put(uptoken, key, buffer, extra, (err, ret) => {
   if (!err) {
      console.log('https://cdn1.lncld.net/' + ret.key);
    } else {
      console.log(err);
    }
    cb();
  });
};

gulp.task('clean-dist', () => {
  gulp.src([
    'dist/*.js',
    'dist/*.map'
  ]).pipe(clean({
    force: true}
  ));
});

gulp.task('browserify', ['clean-dist'], () => {
  const bundle = browserify({entries: './src/av-browser.js'});
  return bundle.bundle()
    .pipe(source('av-es6.js'))
    .pipe(gulp.dest('dist'));
});

// 编译浏览器版本
gulp.task('babel-browser', ['browserify'], () => {
  return gulp.src('dist/av-es6.js')
    // .pipe(sourcemaps.init())
    .pipe(babel({
      compact: false
    }))
    .pipe(concat('av.js'))
    // .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['babel-browser'], () => {
  return gulp.src([
      'dist/av.js'
    ])
    .pipe(uglify())
    .pipe(rename((path) => {
      // path.basename += '-mini';
      path.basename = 'av-min';
    }))
    .pipe(gulp.dest('dist'));

  // return gulp.src(['dist/av-es5.js'])
  //   .pipe(clean());
});

gulp.task('compress-scripts', ['uglify'], () => {
  const version = getAVVersion();
  gulp.src(['dist/*.tar.gz'])
    .pipe(clean());

  return gulp.src([
      'dist/av-es6.js',
      'dist/av.js',
      'dist/av-min.js',
      'readme.txt'
    ])
    .pipe(tar('avos-javascript-sdk-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean-node', () => {
  return gulp.src(['dist/node/**/*.*'])
    .pipe(clean({force: true}));
});

// 编译出 Node 版本
gulp.task('babel-node', ['clean-node'], () => {
  return gulp.src('src/**/*.js')
    // .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(concat('av.js'))
    // .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('dist/node/'));
});

// 压缩 node 版本代码
gulp.task('uglify-node', ['babel-node'], () => {
  return gulp.src([
      'dist/node/**/*.js'
    ])
    .pipe(uglify())
    .pipe(gulp.dest('dist/node/'));
});

gulp.task('clean-demo', () => {
  return gulp.src(['demo/test-es5.js'])
    .pipe(clean());
});

// 编译 Demo 中的代码
gulp.task('babel-demo', ['clean-demo'], () => {
  return gulp.src('demo/**/*.js')
    // .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('test-es5.js'))
    // .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('demo/'));
});

gulp.task('docs', shell.task([
  'mkdir -p dist/js-sdk-api-docs',
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc src/',
]));

gulp.task('compress-docs', ['docs'], () => {
  const version = getAVVersion();
  return gulp.src(['dist/js-sdk-api-docs/**'])
    .pipe(tar('js-sdk-api-docs-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

// Istanbul unit test coverage plugin for gulp.
gulp.task('instrument', ['release'], () => {
  return gulp.src(['dist/node/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

// 执行单元测试
gulp.task('test', [
  'instrument', 'release'
], () => {
  return gulp.src('test/*.js', {
      read: false
    })
    .pipe(order([
      'test.js',
      'file.js',
      'error.js',
      'object.js',
      'user.js',
      'query.js',
      'geopoint.js',
      'acl.js',
      'role.js',
      'master_key.js',
      'status.js',
      'sms.js',
      'search.js'
    ]))
    .pipe(mocha({
      timeout: 300000,
    }))
    .pipe(istanbul.writeReports());
});

// 上传到 CDN
gulp.task('upload', ['compress-scripts'], (cb) => {
  uploadCDN('./dist/av-mini.js', getAVVersion(), () => {});
});

// 生成 release 文件
gulp.task('release', [
  // 生成浏览器版本
  'clean-dist',
  'browserify',
  'babel-browser',
  'uglify',
  'compress-scripts',
  // 生成 node 版本
  'clean-node',
  'babel-node'
]);

// 生成 API 文档
gulp.task('doc', [
  'docs',
  'compress-docs'
]);

// 浏览器开发时使用
gulp.task('dev', [
  'clean-dist',
  'browserify',
  'babel-browser',
  'uglify',
  'babel-demo'
], () => {
  browserSync({
    notify: false,
    port: 8888,
    server: {
      baseDir: ['demo'],
      routes: {
        '/dist': 'dist'
      }
    }
  });

  gulp.watch('src/**/*.js', [
    'clean-dist',
    'browserify',
    'babel-browser',
    'uglify'
  ]);

  gulp.watch([
    'demo/*.html',
    'demo/*.js',
    'dist/*.js'
  ], [
    'babel-demo'
  ]).on('change', reload);
});

