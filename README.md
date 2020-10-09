# LeanCloud JavaScript SDK

[![npm](https://img.shields.io/npm/v/leancloud-storage.svg?style=flat-square)](https://www.npmjs.com/package/leancloud-storage)
![gzip size](http://img.badgesize.io/leancloud/javascript-sdk/dist/dist/av-min.js.svg?compression=gzip&style=flat-square)
[![Build Status](https://img.shields.io/travis/leancloud/javascript-sdk.svg?style=flat-square)](https://travis-ci.org/leancloud/javascript-sdk)
[![Codecov](https://img.shields.io/codecov/c/github/leancloud/javascript-sdk.svg?style=flat-square)](https://codecov.io/github/leancloud/javascript-sdk)
[![Known Vulnerabilities](https://snyk.io/test/github/leancloud/javascript-sdk/badge.svg?style=flat-square)](https://snyk.io/test/github/leancloud/javascript-sdk)

JavaScript SDK for [LeanCloud](http://leancloud.cn/).

## 安装

```
// npm 安装
npm install leancloud-storage --save
// npm 安装 4.x 版本
npm install leancloud-storage@4 --save
```

## 文档

- [安装文档](https://leancloud.cn/docs/sdk_setup-js.html)
- [使用文档](https://leancloud.cn/docs/leanstorage_guide-js.html)
- [API 文档](https://leancloud.github.io/javascript-sdk/docs/)

## 支持

- 如果你发现了新的 bug，或者有新的 feature request，请新建一个 issue
- 在使用过程中遇到了问题时
  - 如果你是商用版用户，请新建一个工单。
  - 也可以在 [论坛](https://forum.leancloud.cn/) 提问、讨论。

## 贡献

如果你希望为这个项目贡献代码，请按以下步骤进行：

- `fork` 这个项目
- `npm install` 安装相关依赖
- 开发和调试
- 确保测试全部通过 `npm run test`
- 提交并发起 `Pull Request`

项目的目录结构说明如下：

```
├── dist                               // 编译之后生成的文件将会在此目录下
│   ├── browser
│   │   └── lc.min.js                  // UMD 格式, 包含 browser adapters
│   ├── lc.min.js                      // UMD 格式
│   ├── index.cjs.js                   // CommonJS 格式
│   ├── index.esm.js                   // ES Module 格式
│   └── ...
├── live-query                         // LiveQuery 插件
│   ├── dist
│   │   ├── index.cjs.js               // CommonJS 格式
│   │   ├── index.esm.js               // ES Module 格式
│   │   └── live-query.min.js          // UMD 格式
│   └── package.json
└── test                               // 测试
```

## 发布流程

1. 遵循 semver 提升版本号
   - src/const.ts/`SDK_VERSION`
   - package.json/`version`
2. 对照 commit 历史写 changelog
3. 提交当前所有改动
4. 等待持续集成 pass
5. 使用 GitHub 基于 dist 分支发布一个 release
6. Fetch and checkout remote `dist` branch 并确认该提交的内容是即将发布的版本
7. npm publish（`npm publish`，需 npm 协作者身份），如果是 pre-release 版本需要带 next tag
