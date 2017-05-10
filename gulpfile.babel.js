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
  const key = `static/js/${version}/${path.basename(file)}`;
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

gulp.task('clean-dist', () =>
  gulp.src([
    'dist/**/*.*',
  ]).pipe(clean({
    force: true
  }))
);

// 编译浏览器版本
gulp.task('bundle-browser', ['clean-dist'], shell.task('npm run build:browser'));
gulp.task('bundle-rn', ['clean-dist'], shell.task('npm run build:rn'));
gulp.task('bundle-weapp', ['clean-dist'], shell.task('npm run build:weapp'));

// 编译出 Node 版本
gulp.task('babel-node', ['clean-dist'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/node/'));
});

// 上传到 CDN
gulp.task('upload', () => {
  [
    './dist/av-min.js',
    './dist/av-weapp-min.js',
    './dist/av.js',
    './dist/av-weapp.js',
    './dist/av-live-query-min.js',
    './dist/av-live-query-weapp-min.js',
    './dist/av-live-query.js',
    './dist/av-live-query-weapp.js',
  ].map(uploadCDN).map(file => `${file}.map`).map(uploadCDN);
});

// 生成 release 文件
gulp.task('build', [
  'clean-dist',
  'bundle-browser',
  'bundle-rn',
  'bundle-weapp',
  'babel-node'
]);
