#0.6.7 日期：2015 年 12 月 3 日
* 撤销了 0.6.6 中会与 node 的 domain 模块冲突的优化。

#0.6.6 日期：2015 年 12 月 1 日
* 修复 LeanEngine 中文件上传位置错误。
* 提升了在 node 中运行的性能。

# 0.6.5 日期：2015 年 11 月 13 日
* 修复 us 节点上传文件错误。

# 0.6.4 日期：2015 年 10 月 27 日
* 修复 localStorage 没有生效的 Bug，感谢热心用户反馈。
* AV.SearchQuery 增加 hasMore 和 reset 方法。

# 0.6.3 日期：2015 年 10 月 22 日
* 修复 AV.Role 的兼容性问题。

# 0.6.2 日期：2015 年 10 月 22 日
* 修复 Follower/Followee 查询遇到 undefined 用户抛出异常的 bug。
* 修复在无痕模式浏览器下无法正常运行的 Bug。
* 修复 AV.File 保存可能导致堆栈溢出的 Bug。
* AV.Role 增加默认 ACL 设置。

# 0.6.1 日期：2015 年 09 月 01 日
* 修复 AV.File 在 LeanEngine 中上传 Base64 图片数据损坏的 bug。

# 0.6.0 日期：2015 年 08 月 25 日

* AV.File 在浏览器环境下直接上传文件到七牛，再无大小和频率限制。
* 新增 API  AV.Cloud.getServerDate 用于获取当前服务器时间。
* 修改美国节点 API 域名为 us-api.leancloud.cn
* 使用 browserify 构建 SDK。
* 相同应用重复初始化 SDK 避免告警日志。

# 0.5.8 日期：2015 年 08 月 5 日
* 修复 `AV.Object.destroyAll` 新版本无法工作的 Bug。

# 0.5.7 日期：2015 年 07 月 29 日
* AV.Promise 仅在非 node 环境（如浏览器）默认启用 PromiseA+ 兼容模式
* 增加 AV.Promise.setDebugError 方法，用于在启用 PromiseA+ 模式的时候打印错误信息，方便调试
* 重命名 AV.BigQuery 模块为 AV.Insight，保留兼容 AV.BigQuery，推荐修改。
* 修复 fetchWhenSave 无法在创建对象的时候生效。
* 当重复初始化 SDK 的时候，打印警告日志。
* 修改默认 API 域名为 api.leancloud.cn。

# 0.5.5 日期：2015 年 06 月 29 日
* AV.Promise 启用兼容 Promise+ 模式。
* 增加 AV.BigQuery 相关 API 用于发起离线分析和查询结果等。
* 修正 AV.Query 的 get 方法在遇到 undefined objectId 运行结果不符合预期的 Bug
* 修复 AV.File 无法作为数组保存的 Bug。

# 0.5.4 日期：2015 年 05 月 14 日
* 紧急修复 localStorage 模块大小写名称错误。

# 0.5.2 日期：2015 年 05 月 12 日
* 上传 sdk 到专门的 CDN 加速域名 [https://cdn1.lncld.net/static/](https://cdn1.lncld.net/static/)
* 兼容 ReactNative 运行环境
* 修复 AV.Query 的 addDescending 方法运行不符合预期的 Bug
* AV.Promise 在兼容 Primise+ 模式下优先使用 setImmediate
* AV.Object 的 fetch 方法新增重载方法，接收第一个参数是 fetchOptions ，设置 keys 或者 include 选项。
* AV.Query 支持 sizeEqualTo 方法，查询数组列大小等于特定长度的对象。

# 0.5.1 日期：2015 年 03 月 27 日
* 实现应用内搜索 API，具体请参考[应用内搜索开发指南](https://leancloud.cn/docs/app_search_guide.html)。
* 增加 API : `AV.User.become(sessionToken, options)`。

# 0.5.0 日期: 2015 年 03 月 02 日
* 增强 `AV.Promise`，增加`done,catch,finally,AV.Promise.race` 等方法，兼容 Promise/A+
* 修复更新对象可能更新没有变更的属性的 Bug，减少请求流量。

# 0.4.9 日期: 2015 年 02 月 26 日
* 拆分 sdk，按照模块划分成多个文件。
* 使用 gulp 构建 sdk，清理代码。
* 修复事件流无法发送带有 `AV.File`、`AV.Object` 等类型的 Status。
* 修复 node.js 环境下上传文件没有扩展名的 Bug。

# 0.4.7 日期: 2015 年 01 月 23 日
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
