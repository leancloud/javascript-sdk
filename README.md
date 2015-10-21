# LeanCloud JavaScript SDK [![Build Status](https://travis-ci.org/leancloud/javascript-sdk.svg)](https://travis-ci.org/leancloud/javascript-sdk)

JavaScript SDK for [LeanCloud](http://leancloud.cn/).

## 使用方法请看 [官方文档](http://leancloud.cn/docs/js_guide.html)

## 贡献

* fork 这个项目
* 在本地进行调试，`npm install` 安装相关依赖
  * 执行 `gulp browserify` 会生成浏览器 SDK
  * 服务环境可以通过单元测试调试
* 确保 `gulp test` 的测试全部通过，浏览器环境打开 test/test.html
* 提交并发起 PR

项目的目录结构说明如下：

```
├── README.md
├── bower.json
├── changelog.md
├── dist                               // 编译之后生成的文件将会在此目录下
├── gulpfile.js
├── lib
│   ├── acl.js
│   ├── av-browser.js                  // 浏览器环境入口文件，将会被 browserify 编译
│   ├── av-browser-core.js             // 浏览器环境入口文件，只包含核心依赖，将会被 browserify 编译
│   ├── av.js                          // node.js 环境入口文件
│   ├── bigquery.js
│   ├── browserify-wrapper             // 针对 node.js 与浏览器环境之间差异的不同实现
│   │   ├── localstorage-browser.js
│   │   ├── parse-base64-browser.js
│   │   ├── parse-base64.js
│   │   ├── upload-browser.js
│   │   ├── upload.js
│   │   └── xmlhttprequest-browser.js
│   ├── cloud.js
│   ├── cloudfunction.js
│   ├── collection.js
│   ├── error.js
│   ├── event.js
│   ├── facebook.js
│   ├── file.js
│   ├── geopoint.js
│   ├── history.js
│   ├── insight.js
│   ├── object.js
│   ├── op.js
│   ├── promise.js
│   ├── push.js
│   ├── query.js
│   ├── relation.js
│   ├── role.js
│   ├── router.js
│   ├── search.js
│   ├── status.js
│   ├── user.js
│   ├── utils.js
│   ├── version.js
│   └── view.js
├── package.json
├── readme.txt
├── test                               // 单元测试
│   ├── acl.js
│   ├── bigquery.js
│   ├── cloud.js
│   ├── collection.js
│   ├── error.js
│   ├── file.html
│   ├── file.js
│   ├── file_blob.html
│   ├── file_form.html
│   ├── geopoints.js
│   ├── object.js
│   ├── promise.js
│   ├── query.js
│   ├── search.js
│   ├── sms.js
│   ├── status.js
│   ├── test.html
│   ├── test.js
│   └── user.js
└── tools                              // 构建中依赖的第三方工具
```

## 官方新版本发布流程

* 修改版本号
  * lib/version.js
  * package.json
  * bower.json

* 修改 Changelog

* 打包 Release

```
gulp release
```

* 提交当前所有代码
  * 版本号相关修改
  * change log
  * dist/ 目录中的新代码

* 提交代码，发 pull request

* （merge 后）Github 生成 release 包（for bower）

* 发布到 npm（需 npm 协作者身份）
```
npm publish
```

* 发布到 CDN（需要七牛权限）
```
gulp upload
```
