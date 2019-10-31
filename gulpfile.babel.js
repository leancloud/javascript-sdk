/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

import gulp from 'gulp';
import clean from 'gulp-clean';
import babel from 'gulp-babel';
import shell from 'gulp-shell';

gulp.task('clean-dist', () =>
  gulp.src(['dist/**/*.*']).pipe(
    clean({
      force: true,
    })
  )
);

// 编译浏览器版本
gulp.task(
  'bundle-browser',
  ['clean-dist'],
  shell.task('npm run build:browser')
);
gulp.task('bundle-rn', ['clean-dist'], shell.task('npm run build:rn'));
gulp.task('bundle-weapp', ['clean-dist'], shell.task('npm run build:weapp'));

// 编译出 Node 版本
gulp.task('babel-node', ['clean-dist'], () => {
  return gulp
    .src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/node/'));
});

// 生成 release 文件
gulp.task('build', [
  'clean-dist',
  'bundle-browser',
  'bundle-rn',
  'bundle-weapp',
  'babel-node',
]);
