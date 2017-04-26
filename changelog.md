## 2.2.1 (2017-04-26)
### Bug Fixes
* 修复了 `User.requestLoginSmsCode`，`User.requestMobilePhoneVerify` 与 `User.requestPasswordResetBySmsCode` 方法 `authOptions.validateToken` 参数的拼写错误。

# 2.2.0 (2017-04-25)
### Bug Fixes
* 修复了 Safari 隐身模式下用户无法登录的问题

### Features
* 短信支持图形验证码（需要在控制台应用选项「启用短信图形验证码」）
  * 新增 `Cloud.requestCaptcha` 与 `Cloud.verifyCaptcha` 方法请求、校验图形验证码。
  * `Cloud.requestSmsCode`，`User.requestLoginSmsCode`，`User.requestMobilePhoneVerify` 与 `User.requestPasswordResetBySmsCode` 方法增加了 `authOptions.validateToken` 参数。没有提供有效的 validateToken 的请求会被拒绝。
* 支持客户端查询 ACL（需要在控制台应用选项启用「查询时返回值包括 ACL」）
  * 增加 `Query#includeACL` 方法。
  * `Object#fetch` 与 `File#fetch` 方法增加了 `fetchOptions.includeACL` 参数。

## 2.1.4 (2017-03-27)
### Bug Fixes
* 如果在创建 `Role` 时不指定 `acl` 参数，SDK 会自动为其设置一个「默认 acl」，这导致了通过 Query 得到或使用 `Object.createWithoutData` 方法得到 `Role` 也会被意外的设置 acl。这个版本修复了这个问题。
* 修复了在 React Native for Android 中使用 blob 方式上传文件失败的问题

## 2.1.3 (2017-03-13)
### Bug Fixes
* 修复了调用 `User#refreshSessionToken` 刷新用户的 sessionToken 后本地存储中的用户没有更新的问题
* 修复了初始化可能会造成 disableCurrentUser 配置失效的问题
* 修复了 `Query#destroyAll` 方法 `options` 参数无效的问题

## 2.1.2 (2017-02-17)
### Bug Fixes
* 修复了文件上传时，如果 `fileName` 没有指定扩展名会导致上传文件 `mime-type` 不符合预期的问题
* 修复了清空 ACL 部分对象的权限后没有正常删除对象的问题（by [AntSworD](https://github.com/AntSworD)）

## 2.1.1 (2017-02-07)
### Bug Fixes
* 修复了使用 masterKey 获取一个 object 后再次 save 可能会报 ACL 格式不正确的问题。

# 2.1.0 (2017-01-20)
### Bug Fixes
* 修复了 `File#toJSON` 序列化结果中缺失 objectId 等字段的问题
* 修复了使用 `Query#containsAll`、`Query#containedIn` 或 `Query#notContainedIn` 方法传入大数组时查询结果可能为空的问题
* 修复了文件上传失败后 _File 表中仍有可能残留无效文件记录的问题

### Features
* 增加了 `User#refreshSessionToken` 方法用于刷新用户的 sessionToken
* 增加了 `Query#scan` 方法用于遍历 Class
* 应用内社交模块增加了 `Status.resetUnreadCount` 方法用于重置未读消息数

## 2.0.1 (2017-01-12)
### Bug Fixes
* 修复了在 Node.js 中向国内节点上传文件抛异常的问题
* 修复了小程序中不启用「ES6 转 ES5」选项时加载 SDK 抛异常的问题

# 2.0.0 (2017-01-09)
### Highlight
* **全面支持微信小程序**：包括文件存储在内的所有功能均已支持微信小程序，用户系统还增加了小程序内一键登录的 API。详见 [在微信小程序中使用 LeanCloud](https://leancloud.cn/docs/weapp.html)。
* **Promise first**：Promise 风格的异步 API 已被社区广泛接受，此前回调参数优先于其他参数的设计已过时，因此我们去掉了对 Backbone 回调风格参数的支持。
* **支持对单次操作指定是否使用 masterKey**：此前使用 masterKey 是全局生效的，会导致无法充分利用 ACL 等内建的权限控制机制。此项改进将其生效范围细化到了单次操作。
* **移除 Node.js 0.12 支持**：Node.js 0.12 LTS 已停止维护，请考虑 [升级 Node.js 版本](https://www.joyent.com/blog/upgrading-nodejs)。
  
### Breaking Changes
* 移除了 Node.js 0.12 的支持，请考虑 [升级 Node.js 版本](https://www.joyent.com/blog/upgrading-nodejs)。
* 移除了所有 Backbone 回调风格的参数，请使用 Promise 处理异步操作的结果与异常：
  <details>
  
  ```javascript
  // Backbone callback 回调风格的参数的用法
  object.save(null, {
    success: function(object) {},
    error: function(error, object) {},
  });

  // 需要替换为
  object.save().then(
    function(object) {},
    function(error) {}
  );
  ```

* `AV.Promise` 现在是一个满足 Promises/A+ 标准的实现，所有非标准的方法已被移除，所有非标准的行为已被修正。关于标准 Promise 的更多信息推荐阅读 [《JavaScript Promise 迷你书》](http://liubin.org/promises-book/)
* `AV.Query` 中的大部分 API 启用了更加严格的参数检查。特别的，对于以下 API，当指定 value 的值为 `undefined` 时会抛出异常（之前会直接忽略这个条件或限制）

  - 参数形如 `(key, value)` 类型的条件限制 API，如 `AV.Query#equalTo(key, value)`
  - `AV.Query#limit(value)`
  - `AV.Query#select(value)`

* `AV.Query#get` 方法现在尊重 Class 的 get 权限设置（之前检查的是 find 权限）

* `objectId`、`createdAt`、`updatedAt` 现在是只读字段，尝试 set 这些字段时 SDK 会抛出异常
* `object.get('id')` 与 `object.set('id', '')` 现在将会正确的读、写数据表中的 `id` 字段（之前映射的是 `objectId`）。你现在依然可以使用 `object.id` 来访问数据的 `objectId`。

* 如果你 extend 的 `AV.Object` 子类重写了 `validate` 方法，当属性无效时现在需要 throw 一个 Error（之前是 return 一个 Error）。相应的，`AV.Object#set` 方法如果 set 的值无效，需要通过 try catch 捕获异常（之前通过检查返回值是 false）
  <details>

  ```javascript
  // 之前的用法
  var Student = AV.Object.extend('Student', {
    validate: function(attibutes) {
      if (attributes.age < 0) return new Error('negative age set');
    }
  });
  var tom = new Student();
  if (tom.set('age', -1) === false) {
    console.error('something wrong');
  } else {
    tom.save();
  }

  // 现在的用法
  var Student = AV.Object.extend('Student', {
    validate: function(attibutes) {
      if (attributes.age < 0) throw new Error('negative age set');
    }
  });
  var tom = new Student();
  try {
    tom.set('age', -1);
  } catch (error) {
    console.error(error.message);
  }
  tom.save();
  ```

* 上传文件时不再额外地向文件的 metaData 中写入 mime_type，之前通过 metaData 获取 mime_type 的用法需要更新：
  <details>
  
  ```javascript
  // 之前的用法
  file.metaData('mime_type');

  // 现在的用法
  file.get('mime_type');
  ```

* 移除了 deprecated 的 API，包括：
  - `AV.Object#existed`
  - `AV.User.requestEmailVerfiy` (typo)
  - `AV.useAVCloudCN`
  - `AV.useAVCloudUS`
  - `AV._ajax`
  - `AV._request`

### Features
* 支持微信小程序
* 增加了 `AV.User.loginWithWeapp()` 与 `AV.User#linkWithWeapp()` ，支持在微信小程序中登录
* 增加了 `AV.User#isAuthenticated()`，该方法会校验 sessionToken 的有效性, 废弃 `AV.User#authenticated()`
* 绝大部分会发起网络请求的 API（如保存一个对象）支持通过 `option.useMasterKey` 参数指定该次操作是否要使用 masterKey，设置了该选项的操作会忽略全局的 useMasterKey 设置
* 去掉了 `Object.destroyAll` 方法要求所有删除的对象属于同一个 Class 的限制
* `Object.register()` 方法增加了第二个参数允许指定所注册的 Class 的名字，详情参见 [Object.register - API 文档](https://leancloud.github.io/javascript-sdk/docs/AV.Object.html#.register)。
* 上传文件的 mime_type 现在由服务端进行判断从而支持更多的文件类型
* 增加了 sourcemaps

### Bug Fixes
* 修复了在进行以下操作时可能出现 `URI too long` 异常的问题
  * 使用 `Query#containsAll`、`Query#containedIn` 或 `Query#notContainedIn` 方法时传入了一个大数组
  * 使用 `Object.destroyAll` 方法批量删除大量对象
* 修复了 `Object.set(key, value)` 方法可能会改变（mutate）`value` 的问题
* 修复了查询结果中 File 没有被正确解析的问题
* 修复了在 React Native 中使用 `AV.setProduction` 方法会导致后续操作引起 crash 的问题
* 修复了在 React Native 上传大文件可能出现 `invalid multipart format: multipart: message too large` 异常的问题
* 修复了 `AV.Insight.startJob` 方法中 saveAs 参数未生效的问题
* 修复了抛出 code == -1 的异常时 error.message 可能缺失的问题
* 修复了应用内社交模块的方法在未登录状态下传入了 sessionToken 仍然抛未登录异常的问题

测试版本的更新日志：
<details>

## 2.0.0 (2017-01-09)
### Bug Fixes
* 修复了在 React Native 及小程序中上传大文件可能出现 `invalid multipart format: multipart: message too large` 异常的问题
* 修复了某些情况下上传的文件 mime_type 不正确的问题

# 2.0.0-rc.0 (2016-12-30)
### Breaking Changes
* 移除了 Node.js 0.12 的支持，请考虑 [升级 Node.js 版本](https://www.joyent.com/blog/upgrading-nodejs)。
* 上传文件时不再额外地向文件的 metaData 中写入 mime_type，之前通过 metaData 获取 mime_type 的用法需要更新：
  <details>
  
  ```javascript
  // 之前的用法
  file.metaData('mime_type');

  // 现在的用法
  file.get('mime_type');
  ```
* (internal) `AV._decode(key, value)` 现在变更为 `AV._decode(value[, key])`

### Features
* 上传文件的 mime_type 现在由服务端进行判断从而支持更多的文件类型
* 去掉了 `Object.destroyAll` 方法要求所有删除的对象属于同一个 Class 的限制
* `Object.register()` 方法增加了第二个参数允许指定所注册的 Class 的名字，详情参见 [Object.register - API 文档](https://leancloud.github.io/javascript-sdk/docs/AV.Object.html#.register)。

### Bug Fixes
* 修复了在进行以下操作时可能出现 `URI too long` 异常的问题
  * 使用 `Query#containsAll`、`Query#containedIn` 或 `Query#notContainedIn` 方法时传入了一个大数组
  * 使用 `Object.destroyAll` 方法批量删除大量对象
* 修复了在 React Native 及小程序中使用 `AV.setProduction` 方法会导致后续操作引起 crash 的问题
* 修复了 `Object.set(key, value)` 方法可能会改变（mutate）`value` 的问题
* 修复了查询结果中 File 没有被正确解析的问题
* 修复了 `AV.Insight.startJob` 方法中 saveAs 参数未生效的问题
* 修复了抛出 code == -1 的异常时 error.message 可能缺失的问题

## 2.0.0-beta.6 (2016-11-30)
### Bug Fixes
* 修复了 Android 微信小程序上初始化失败的问题
* 修复了小程序中使用应用内社交抛 `AV is not defined` 异常的问题

### Features
* 增加了 sourcemaps

## 2.0.0-beta.5 (2016-11-16)
### Bug Fixes
* 修复了在 Android 微信小程序上运行时抛 `undefined is not a function` 异常的问题

# 2.0.0-beta.4 (2016-11-11)
### Breaking Changes
* `objectId`、`createdAt`、`updatedAt` 现在是只读字段，尝试 set 这些字段时 SDK 会抛出异常
* `object.get('id')` 与 `object.set('id', '')` 现在将会正确的读、写数据表中的 `id` 字段（之前映射的是 `objectId`）。你现在依然可以使用 `object.id` 来访问数据的 `objectId`。

### Features
* 增加了 `AV.User.loginWithWeapp()` 与 `AV.User#linkWithWeapp()` ，支持在微信小程序中登录
* 增加了 `AV.User#isAuthenticated()`，该方法会校验 sessionToken 的有效性, 废弃 `AV.User#authenticated()`

## 2.0.0-beta.3 (2016-11-8)
### Bug Fixes
* 修复了在微信小程序真机上运行时抛 `ReferenceError: Can't find variable: FormData` 异常的问题
* 修复了 2.0.0-beta.0 中引入的 `AV.Query#select`、`AV.Query#include` 不支持多个参数的问题

## 2.0.0-beta.2 (2016-10-20)
### Features
* `AV.File` 支持微信小程序

## 2.0.0-beta.1 (2016-10-13)
### Features
* 支持微信小程序 0.10.101100

# 2.0.0-beta.0 (2016-9-29)
### Breaking Changes
* 移除了所有 Backbone 回调风格的参数，请使用 Promise 处理异步操作的结果与异常：
  <details>
  
  ```javascript
  // Backbone callback 回调风格的参数的用法
  object.save(null, {
    success: function(object) {},
    error: function(error, object) {},
  });

  // 需要替换为
  object.save().then(
    function(object) {},
    function(error) {}
  );
  ```

* `AV.Promise` 现在是一个满足 Promises/A+ 标准的实现，所有非标准的方法已被移除，所有非标准的行为已被修正。关于标准 Promise 的更多信息推荐阅读 [《JavaScript Promise 迷你书》](http://liubin.org/promises-book/)

* 如果你 extend 的 `AV.Object` 子类重写了 `validate` 方法，当属性无效时现在需要 throw 一个 Error（之前是 return 一个 Error）。相应的，`AV.Object#set` 方法如果 set 的值无效，需要通过 try catch 捕获异常（之前通过检查返回值是 false）
  <details>

  ```javascript
  // 之前的用法
  var Student = AV.Object.extend('Student', {
    validate: function(attibutes) {
      if (attributes.age < 0) return new Error('negative age set');
    }
  });
  var tom = new Student();
  if (tom.set('age', -1) === false) {
    console.error('something wrong');
  } else {
    tom.save();
  }

  // 现在的用法
  var Student = AV.Object.extend('Student', {
    validate: function(attibutes) {
      if (attributes.age < 0) throw new Error('negative age set');
    }
  });
  var tom = new Student();
  try {
    tom.set('age', -1);
  } catch (error) {
    console.error(error.message);
  }
  tom.save();
  ```

* `AV.Query` 中的大部分 API 启用了更加严格的参数检查。特别的，对于以下 API，当指定 value 的值为 `undefined` 时会抛出异常（之前会直接忽略这个条件或限制）

  - 参数形如 `(key, value)` 类型的条件限制 API，如 `AV.Query#equalTo(key, value)`
  - `AV.Query#limit(value)`
  - `AV.Query#select(value)`

* `AV.Query#get` 方法现在尊重 Class 的 get 权限设置（之前检查的是 find 权限）

* (intarnal) `AV.User#_linkWith` 的第二个参数中的 `options.authData` 字段提升为第二个参数
  <details>

  ```javascript
  // 之前的用法
  user._linkWith('weixin', {
    authData: {
      access_token: 'access_token'
    },
  });

  // 现在的用法
  user._linkWith('weixin', {
    access_token: 'access_token'
  });
  ```

* 移除了 deprecated 的 API，包括：
  - `AV.Object#existed`
  - `AV.User.requestEmailVerfiy` (typo)
  - `AV.useAVCloudCN`
  - `AV.useAVCloudUS`
  - `AV._ajax`
  - `AV._request`

### Bug Fixes
* 修复了应用内社交模块的方法在未登录状态下传入了 sessionToken 仍然抛未登录异常的问题

### Features
* 对象存储功能支持微信小程序
* 绝大部分会发起网络请求的 API（如保存一个对象）支持通过 `option.useMasterKey` 参数指定该次操作是否要使用 masterKey，设置了该选项的操作会忽略全局的 useMasterKey 设置

</details>

## 1.4.0 (2016-9-1)
相比于 v1.4.0-beta.0:
* 修复了 `AV.File#save` 方法的 `onprogress` 参数失效的问题

# 1.4.0-beta.0 (2016-8-23)
* 支持 ES2015 的 extends 语法来声明 `AV.Object` 的子类，增加了 `AV.Object.register` 方法用于注册声明的子类。

  ```javascript
  class Article extends AV.Object {}
  AV.Object.register(Article);
  ```

* `AV.Query` 支持查询 `AV.File`
* 修复多次调用 `AV.Object.extend('ClassName')` 后可能导致堆栈溢出的问题
* 修复 `AV.Query#addDescending` 没有返回 query 的问题，现在支持链式调用了
* 修复 React Native 0.32 中找不到 `react-native` 模块的问题

## 1.3.3 (2016-8-2)
* 修复在 `AV.Object` 子类某属性的 getter 中调用 `AV.Object#get` 方法时调用栈溢出的问题

## 1.3.2 (2016-7-26)
* 修复 1.3.1 中未彻底解决的 `A promise was resolved even though it had already been resolved` 异常问题

## 1.3.1 (2016-7-21)
* 修复多次调用 `AV.init` 抛出 `A promise was resolved even though it had already been resolved` 异常的问题

# 1.3.0 (2016-7-20)
* 增加 `AV.Object.fetchAll()` 方法
* 修复抛出的异常没有堆栈信息的问题
* 修复在某些异常情况下，发出的请求不带域名的问题

## 1.2.1 (2016-6-30)
* 修复美国节点文件上传成功后 File 实例没有 id 的问题

# 1.2.0 (2016-6-29)
* 增加 `AV.User.associateWithAuthData()` 方法
* 修复美国节点文件上传失败的问题
* 修复 `AV.User.signUpOrlogInWithAuthData()` 省略 callback 参数会报异常的问题
* 修复 React Native 中 import leancloud-storage 抛 `cannot read property "APIServerURL" for undefined` 异常的问题

# 1.1.0 (2016-6-27)
* 防止 SDK 覆盖全局变量 AV
* Object.add、Object.addUnique、Object.remove 等方法支持从传入非数组类型的 value 参数
* 修复路由缓存异常时，不再出现多次 410 错误请求
* 美国节点上传到 S3 改为直接上传，不再通过服务器中转

# 1.0.0 (2016-5-30)
* 弃用 AV.Error 对象，改为内部模块
* 移除 AV.applicationProduction 改为 AV._config.applicationProduction 内部接口
* 调整 npm 包名为 leancloud-storage

# 1.0.0-rc9.2 (2016-5-23)
* 修复了上传文件成功却进入失败回调的问题。
* 修复 `AV.Object#fetch` 在某些情况下抛出 `fetchOptions.include.join is not a function` 异常的问题。

# 1.0.0-rc9.1 (2016-5-17)
* 修复了上传文件到 COS 时报错的问题。

# 1.0.0-rc9 (2016-5-16)
* 修复了错误的 `package.browser` 字段引起的部分打包工具异常。
* 修复浏览器中 ajax 方法中错误的转码方式。
* 修复 `AV.Object#get` 方法返回部分字段类型异常。
* 修复 `AV.Object#fetch` 方法 `read sessionToken from undefined` 的错误。
* 支持节点动态路由。
* 文件上传使用 https 协议。
* 文件上传支持 React Native for Android。

# 1.0.0-rc8 (2016-4-6)
* **(BREAKING)** 添加了 AV.init 方法，该方法接收一个名为 options 的参数字典，废弃 AV.initialize 方法。
* **(BREAKING)** 为 AV.Object#save 方法的 options 参数添加了 fetchWhenSave 选项，废弃 AV.Object#fetchWhenSave 方法。
* **(BREAKING)** 添加了 disableCurrentUser 选项（可在 AV.init 方法中设置），当开启时：
  * AV.User.current 和 AV.User.currentAsync 打印警告并返回 null。
  * signUp, logIn, fetch, become 等方法不再写入全局状态。
  * 发起请求时不再向服务器发送 installationId。
  * AV.File 不再会自动设置 owner, 请在 data 参数中传入 owner 选项（AV.User 对象）。
* 为所有会发起网络请求的操作（save 等）的 options 参数添加了 sessionToken 选项，可通过传入该选项指定请求所使用的 sessionToken。
* 添加了 AV.User.getSessionToken 方法。
* 添加了 AV.User#logOut 这个实例方法（之前只有类方法）。
* 为 AV.Object#save 方法的 options 参数添加了 query 选项，该次更新操作在对象最新状态满足 query 时才会执行。
* 修正了在某些错误情况下返回值格式不正确的错误。
* 使用了更加安全的鉴权机制，以降低 App Key 在传输过程中泄露的风险。
* 移除了特殊跨域兼容实现，现在遵循 CORS。

# 1.0.0-rc7 (2016-2-16)
* 添加 AV.Cloud.rpc 方法
* 修复了 `AV.User#fetch` 不会运行回调函数的 bug。

# 1.0.0-rc6 (2016-2-1)
* 修复了云引擎中文件上传到 AWS 的问题。
* 修复了 `AV.User#fetch` 不支持 fetch options 的问题。
* 修复了使用 Pointer 时可能出现类型错误的问题。

# 1.0.0-rc5 (2015-11-24)
* AV.File 新增 fetch 方法。
* 废弃 AV.Object 的 existed 方法。
* 移除 AV.BigQuery 模块。该模块在 0.5.7 中废弃。
* 提升了在 node 中运行的性能。
* 修复了一些 IE 兼容性问题。

# 1.0.0-rc4 (2015-11-12)
* **(BREAKING)** 移除了 av-core[-mini].js，请直接使用 av[-mini].js。移除了 `Collection`、`Router` 等 Backbone 兼容模块，请直接使用 Backbone。
* 新增第三方平台帐号登录 API：`AV.User.signUpOrlogInWithAuthData()`。 感谢 @jacktator 。
* 修复海外节点文件上传方式错误的问题。

# 1.0.0-rc3 (2015-10-27)
* 修复 `AV._request` 某些情况下无法正常工作的 Bug。
* 修复某些登录 API 没有更新 currentUser 的问题
* 修复 localStorage 没有生效的 Bug，感谢热心用户反馈。
* AV.SearchQuery 增加 hasMore 和 reset 方法。

## 0.6.4 (2015-10-27)
* 修复 localStorage 没有生效的 Bug，感谢热心用户反馈。
* AV.SearchQuery 增加 hasMore 和 reset 方法。

# 1.0.0-rc2 (215-10-22)
* 兼容 React Native 运行环境。
* 修复 AV.Role 的兼容性问题。
* 修复 `AV._request` 某些情况下无法正常工作的 Bug。

## 0.6.3 (2015-10-22)
* 修复 AV.Role 的兼容性问题。

# 1.0.0-rc1 (215-10-22)
* 兼容 React Native 运行环境。

## 0.6.2 (2015-10-22)
* 修复 Follower/Followee 查询遇到 undefined 用户抛出异常的 bug。
* 修复在无痕模式浏览器下无法正常运行的 Bug。
* 修复 AV.File 保存可能导致堆栈溢出的 Bug。
* AV.Role 增加默认 ACL 设置。

## 0.6.1 (2015-09-01)
* 修复 AV.File 在 LeanEngine 中上传 Base64 图片数据损坏的 bug。

# 0.6.0 (2015-08-25)

* AV.File 在浏览器环境下直接上传文件到七牛，再无大小和频率限制。
* 新增 API  AV.Cloud.getServerDate 用于获取当前服务器时间。
* 修改美国节点 API 域名为 us-api.leancloud.cn
* 使用 browserify 构建 SDK。
* 相同应用重复初始化 SDK 避免告警日志。

## 0.5.8 (2015-08-5)
* 修复 `AV.Object.destroyAll` 新版本无法工作的 Bug。

## 0.5.7 (2015-07-29)
* AV.Promise 仅在非 node 环境（如浏览器）默认启用 PromiseA+ 兼容模式
* 增加 AV.Promise.setDebugError 方法，用于在启用 PromiseA+ 模式的时候打印错误信息，方便调试
* 重命名 AV.BigQuery 模块为 AV.Insight，保留兼容 AV.BigQuery，推荐修改。
* 修复 fetchWhenSave 无法在创建对象的时候生效。
* 当重复初始化 SDK 的时候，打印警告日志。
* 修改默认 API 域名为 api.leancloud.cn。

## 0.5.5 (2015-06-29)
* AV.Promise 启用兼容 Promise+ 模式。
* 增加 AV.BigQuery 相关 API 用于发起离线分析和查询结果等。
* 修正 AV.Query 的 get 方法在遇到 undefined objectId 运行结果不符合预期的 Bug
* 修复 AV.File 无法作为数组保存的 Bug。

## 0.5.4 (2015-05-14)
* 紧急修复 localStorage 模块大小写名称错误。

## 0.5.2 (2015-05-12)
* 上传 sdk 到专门的 CDN 加速域名 [https://cdn1.lncld.net/static/](https://cdn1.lncld.net/static/)
* 兼容 ReactNative 运行环境
* 修复 AV.Query 的 addDescending 方法运行不符合预期的 Bug
* AV.Promise 在兼容 Primise+ 模式下优先使用 setImmediate
* AV.Object 的 fetch 方法新增重载方法，接收第一个参数是 fetchOptions ，设置 keys 或者 include 选项。
* AV.Query 支持 sizeEqualTo 方法，查询数组列大小等于特定长度的对象。

## 0.5.1 (2015-03-27)
* 实现应用内搜索 API，具体请参考[应用内搜索开发指南](https://leancloud.cn/docs/app_search_guide.html)。
* 增加 API : `AV.User.become(sessionToken, options)`。

# 0.5.0 (2015-03-02)
* 增强 `AV.Promise`，增加`done,catch,finally,AV.Promise.race` 等方法，兼容 Promise/A+
* 修复更新对象可能更新没有变更的属性的 Bug，减少请求流量。

## 0.4.9 (2015-02-26)
* 拆分 sdk，按照模块划分成多个文件。
* 使用 gulp 构建 sdk，清理代码。
* 修复事件流无法发送带有 `AV.File`、`AV.Object` 等类型的 Status。
* 修复 node.js 环境下上传文件没有扩展名的 Bug。

## 0.4.7 (2015-01-23)
* 修复页面跳转更新 user 导致 current user 属性丢失的 Bug。
* 增加 `AV.User.updatePassword` 方法，根据老密码修改成新密码。
* 为 `AV.Object` 增加 `getObjectId, getUpdatedAt, getCreatedAt` 三个方法。
* 增加 `AV.User#signUpOrlogInWithMobilePhone` 手机一键登录。
* 一些内部改进和重构。

## 0.4.6 (2014-12-11)
* 添加新方法 `AV.File.createWithoutData(objectId)`，根据 objectId 构造 AV.File
* 添加 `AV.Query.and` 方法用于复合查询
* `AV.File` 支持 get/set ACL
* 增加新方法 `AV.setProduction(boolean)` 用于设置生产环境或者测试环境。

## 0.4.5 (2014-10-29)
* CQL 查询支持占位符,AV.Query.doCloudQuery 方法增加三个参数版本
* AV.Push 增加 cql 属性说明，可以通过 CQL 指定推送查询条件。
* 部分内部代码重构。

## 0.4.4 (2014-10-14)
* 修复 node.js 下上传文件无法指定文件 mime type 的Bug
* 添加 `AV.Object.new` 函数用来创建对象，避免代码压缩带来的问题。

# 0.4.3

* 添加 CQL 查询支持，增加 `AV.Query.doCloudQuery` 方法。

# 老版本的 changelog
https://download.avoscloud.com/sdk/javascript/changelog.txt
