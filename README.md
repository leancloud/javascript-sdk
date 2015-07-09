# LeanCloud Javascript SDK

Javascript SDK for [LeanCloud](http://leancloud.cn).

# 安装

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
//或者你只是用最核心的存储、推送等功能，可以使用精简版的core.js
<script src="https://cdn1.lncld.net/static/js/av-core-mini-{版本号}.js"></script>
```

## Changelog

* [SDK Download](https://leancloud.cn/docs/sdk_down.html)

# 开发指南

* [JavaScript SDK 开发指南](http://leancloud.cn/docs/js_guide.html)
* [JavaScript SDK API文档](http://leancloud.cn/docs/api/javascript/index.html)
* [云代码开发指南](http://leancloud.cn/docs/cloud_code_guide.html)


## Build

We use [gulp](http://gulpjs.com/) to build the project.

how to use:

```sh
npm install -g gulp 
cd javascript-sdk
npm install
gulp pack       
gulp release    
```

# 协议

[MIT License](http://opensource.org/licenses/MIT)

# 内部发布

## 修改版本号

* lib/version.js
* package.json
* bower.json

## 修改 changelog

## Release

```
gulp release
```

## 提交，打上 tag 并推送到 Github

tag 要求为 `v{版本号}`, dist 目录也需要更新提交。

## 发布到 bower 
```
bower register leancloud-javascript-sdk git@github.com:leancloud/javascript-sdk.git
```

## 发布到 npm

```
npm publish
```

## 发布到 CDN

```
gulp upload
```

