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
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import source from 'vinyl-source-stream';
import streamify from 'gulp-streamify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import babel from 'gulp-babel';
import { version } from './package.json';

const reload = browserSync.reload;

// 获取当前版本号
const getAVVersion = () => version;

const uploadCDN = (file, version, cb) => {
  qiniu.conf.ACCESS_KEY = process.env.CDN_QINIU_KEY;
  qiniu.conf.SECRET_KEY = process.env.CDN_QINIU_SECRET;
  if (!qiniu.conf.ACCESS_KEY || !qiniu.conf.SECRET_KEY) {
    throw new Error('Need Qiniu CDN_QINIU_KEY and CDN_QINIU_SECRET');
  }
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

// 编译浏览器版本
gulp.task('bundle-browser', () => {
  return browserify({
    entries: './src/index.js',
    standalone: 'AV'
  }).bundle()
  .pipe(source('av.js'))
    // .pipe(sourcemaps.init())
    .pipe(streamify(babel({
      compact: false
    })))
    // .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['bundle-browser', 'bundle-weapp'], () => {
  return gulp.src([
      'dist/av.js',
      'dist/av-weapp.js'
    ])
    .pipe(uglify())
    .pipe(rename((path) => {
      path.basename += '-min';
    }))
    .pipe(gulp.dest('dist'));

  // return gulp.src(['dist/av-es5.js'])
  //   .pipe(clean());
});

gulp.task('bundle-weapp', () =>
  browserify({
    entries: './src/index-weapp.js',
    standalone: 'AV'
  })
  .bundle()
  .pipe(source('av-weapp.js'))
  .pipe(streamify(babel({
    compact: false
  })))
  .pipe(gulp.dest('dist'))
)

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

gulp.task('clean-demo', () => {
  return gulp.src(['demo/test-es5.js'])
    .pipe(clean());
});

// 编译 Demo 中的代码
gulp.task('babel-demo', ['clean-demo'], () => {
  return gulp.src('demo/*.js')
    // .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('test-es5.js'))
    // .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('demo/'));
});

// 上传到 CDN
gulp.task('upload', () => {
  uploadCDN('./dist/av-min.js', getAVVersion(), () => {});
  uploadCDN('./dist/av-weapp-min.js', getAVVersion(), () => {});
  uploadCDN('./dist/av.js', getAVVersion(), () => {});
  uploadCDN('./dist/av-weapp.js', getAVVersion(), () => {});
});

// 生成 release 文件
gulp.task('release', [
  // 生成浏览器版本
  'clean-dist',
  'bundle-browser',
  'bundle-weapp',
  'uglify',
  // 生成 node 版本
  'clean-node',
  'babel-node'
]);

// 浏览器开发时使用
gulp.task('dev', [
  'clean-dist',
  'bundle-browser',
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
