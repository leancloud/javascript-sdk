# LeanCloud Javascript SDK

Javascript SDK for [LeanCloud](http://leancloud.cn).

# 安装

```sh
$ npm install avoscloud-sdk
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

## 发布到 bower 
```
bower register leancloud-jssdk git@github.com:leancloud/javascript-sdk.git
```
