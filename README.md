# LeanCloud JavaScript SDK

JavaScript SDK for [LeanCloud](http://leancloud.cn/).

## 安装

### npm

```sh
$ npm install avoscloud-sdk
```
### bower

```sh
$ bower install leancloud-javascript-sdk
```

### CDN 加速

```html
<script src="https://cdn1.lncld.net/static/js/av-mini-{版本号}.js"></script>
// 或者你只是用最核心的存储、推送等功能，可以使用精简版的core.js
<script src="https://cdn1.lncld.net/static/js/av-core-mini-{版本号}.js"></script>
```

## Changelog

* [SDK Download](https://leancloud.cn/docs/sdk_down.html)

## 开发指南

* [JavaScript SDK 开发指南](http://leancloud.cn/docs/js_guide.html)
* [JavaScript SDK API 文档](http://leancloud.cn/docs/api/javascript/index.html)
* [云代码开发指南](http://leancloud.cn/docs/cloud_code_guide.html)

### 目录结构

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


### Build

We use [gulp](http://gulpjs.com/) to build the project.

how to use:

```sh
npm install -g gulp 
cd javascript-sdk
npm install
gulp pack       
gulp release    
```

### 内部发布

#### 修改版本号

* lib/version.js
* package.json
* bower.json

#### 修改 Changelog

#### Release

```
gulp release
```

#### 提交，打上 tag 并推送到 GitHub

tag 要求为 `v{版本号}`，dist 目录也需要更新提交。

#### 发布到 bower
```
bower register leancloud-javascript-sdk git@github.com:leancloud/javascript-sdk.git
```

#### 发布到 npm

```
npm publish
```

#### 发布到 CDN

```
gulp upload
```

## License

[MIT License](http://opensource.org/licenses/MIT)
