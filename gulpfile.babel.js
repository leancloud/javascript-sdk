/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

import path from 'path';
import qiniu from 'qiniu';
import fs from 'fs';
import gulp from 'gulp';
import clean from 'gulp-clean';
import babel from 'gulp-babel';
import shell from 'gulp-shell';
import { version } from './package.json';

const uploadCDN = (file) => {
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
  });
  return file;
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
gulp.task('bundle-browser', shell.task('npm run build:browser'));
gulp.task('bundle-rn', shell.task('npm run build:rn'));
gulp.task('bundle-weapp', shell.task('npm run build:weapp'));

gulp.task('uglify', ['bundle-browser', 'bundle-weapp'], shell.task([
  'npm run uglify:browser',
  'npm run uglify:weapp',
]));

gulp.task('clean-node', () => {
  return gulp.src(['dist/node/**/*.*'])
    .pipe(clean({force: true}));
});

// 编译出 Node 版本
gulp.task('babel-node', ['clean-node'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel())
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
  [
    './dist/av-min.js',
    './dist/av-weapp-min.js',
    './dist/av.js',
    './dist/av-weapp.js',
  ].map(uploadCDN).map(file => `${file}.map`).map(uploadCDN);
});

// 生成 release 文件
gulp.task('build', [
  'clean-dist',
  'bundle-browser',
  'bundle-rn',
  'bundle-weapp',
  'uglify',
  'clean-node',
  'babel-node'
]);
