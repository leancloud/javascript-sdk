# 0.5.4 日期：2015 年 5 月 14 日
* 紧急修复 localStorage 模块大小写名称错误。

# 0.5.2 日期：2015 年 5 月 12 日
* 上传 sdk 到专门的 CDN 加速域名 [https://cdn1.lncld.net/static/](https://cdn1.lncld.net/static/)
* 兼容 ReactNative 运行环境
* 修复 AV.Query 的 addDescending 方法运行不符合预期的 Bug
* AV.Promise 在兼容 Primise+ 模式下优先使用 setImmediate
* AV.Object 的 fetch 方法新增重载方法，接收第一个参数是 fetchOptions ，设置 keys 或者 include 选项。
* AV.Query 支持 sizeEqualTo 方法，查询数组列大小等于特定长度的对象。

# 0.5.1 日期：2015 年 3 月 27 日
* 实现应用内搜索 API，具体请参考[应用内搜索开发指南](https://leancloud.cn/docs/app_search_guide.html)。
* 增加 API : `AV.User.become(sessionToken, options)`。

# 0.5.0 日期: 2015 年 3 月 02 日
* 增强 `AV.Promise`，增加`done,catch,finally,AV.Promise.race` 等方法，兼容 Promise/A+
* 修复更新对象可能更新没有变更的属性的 Bug，减少请求流量。

# 0.4.9 日期: 2015 年 2 月 26 日
* 拆分 sdk，按照模块划分成多个文件。
* 使用 gulp 构建 sdk，清理代码。
* 修复事件流无法发送带有 `AV.File`、`AV.Object` 等类型的 Status。
* 修复 node.js 环境下上传文件没有扩展名的 Bug。

# 0.4.7 日期: 2015 年 1 月 23 日
* 修复页面跳转更新 user 导致 current user 属性丢失的 Bug。
* 增加 `AV.User.updatePassword` 方法，根据老密码修改成新密码。
* 为 `AV.Object` 增加 `getObjectId, getUpdatedAt, getCreatedAt` 三个方法。
* 增加 `AV.User#signUpOrlogInWithMobilePhone` 手机一键登录。
* 一些内部改进和重构。

# 0.4.6 日期：2014 年 12 月 11 日
* 添加新方法 `AV.File.createWithoutData(objectId)`，根据 objectId 构造 AV.File
* 添加 `AV.Query.and` 方法用于复合查询
* `AV.File` 支持 get/set ACL
* 增加新方法 `AV.setProduction(boolean)` 用于设置生产环境或者测试环境。

# 0.4.5 日期：2014 年 10 月 29 日
* CQL 查询支持占位符,AV.Query.doCloudQuery 方法增加三个参数版本
* AV.Push 增加 cql 属性说明，可以通过 CQL 指定推送查询条件。
* 部分内部代码重构。

# 0.4.4 日期：2014 年 10 月 14 日
* 修复 node.js 下上传文件无法指定文件 mime type 的Bug
* 添加 `AV.Object.new` 函数用来创建对象，避免代码压缩带来的问题。

# 0.4.3

* 添加 CQL 查询支持，增加 `AV.Query.doCloudQuery` 方法。

# 老版本的 changelog
https://download.avoscloud.com/sdk/javascript/changelog.txt
