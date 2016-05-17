# LeanCloud JavaScript SDK [![Build Status](https://travis-ci.org/leancloud/javascript-sdk.svg)](https://travis-ci.org/leancloud/javascript-sdk) [![codecov.io](https://codecov.io/github/leancloud/javascript-sdk/coverage.svg?branch=master)](https://codecov.io/github/leancloud/javascript-sdk?branch=master)

JavaScript SDK for [LeanCloud](http://leancloud.cn/).

## 使用方法请看 [官方文档](http://leancloud.cn/docs/js_guide.html)

## 版本说明

* 0.x.y 版本，是不兼容 React Native 运行时的老版本 SDK，相对稳定，云引擎主要依赖这个分支版本。
* 1.0.0-x 版本，是我们最新开发的兼容 React Native 运行时的版本，处于开放测试阶段，欢迎大家尝试。我们最终将使用这个分支替代云引擎里的 `0.x.y` 版本。

可以使用以下命令安装 1.0.0-x 版本：`npm install avoscloud-sdk@next`。

## 贡献代码

* `fork` 这个项目
* `npm install` 安装相关依赖
* 开发和调试
  * 浏览器环境执行 `gulp dev`，会自动启动 `demo` 目录，可在 `test-es6.js` 中修改和测试，`test-es5.js` 为自动生成的代码
  * Nodejs 环境可以在 `demo/node` 目录中，通过执行 `node test.js` 使用 `test.js` 文件开发与调试。推荐安装 `node inspector` 来调试，安装后执行 `node-debug test.js`。每次修改代码后，如果开发代码引用的是 dist 目录中的代码，需要执行 `gulp release`
* 确保测试全部通过 `gulp test`，浏览器环境打开 `test/test.html`
* 提交并发起 `Pull Request`
* 执行 `gulp release` 会生成全部版本的 SDK

项目的目录结构说明如下：

```
├── README.md                          // 说明文档
├── demo                               // demo 目录中有一些代码片段，主要用于开发与调试
├── changelog.md
├── dist                               // 编译之后生成的文件将会在此目录下
│   ├── av-es6.js                      // 合并后的完整源码（ES6 版本）
│   ├── av.js                          // 合并并编译后的完整源码（ES5 版本）
│   ├── av-min.js                      // 合并、压缩并编译后的源码（ES5 版本）
│   ├── node                           // 目录中为生成的 nodejs 版本代码
│   └── ...
├── gulpfile.babel.js
├── src
│   ├── av.js                          // node.js 环境入口文件
│   ├── browserify-wrapper             // 目录中为针对 node.js 与浏览器环境之间差异的不同实现
│   └── ...
├── package.json
├── readme.txt
├── test                               // 单元测试
│   └── ...
└── tools                              // 构建中依赖的第三方工具
```

## 官方新版本发布流程

* 修改版本号
  * src/version.js
  * package.json
  * bower.json
* 修改 Changelog
* 打包（执行 `gulp release`）
* 提交当前所有代码
  * 版本号相关修改
  * 对照 commit 历史写 change log
  * dist/ 目录中的新代码
* 提交代码，发 Pull Request
* 通过 review，merge 代码
* Github 生成 release 包（for bower）
* 发布到 npm，需 npm 协作者身份（执行 `npm publish`）
* 发布到 CDN，需要七牛权限（执行 `gulp upload`）
* 提醒所有相关工程师完善文档

