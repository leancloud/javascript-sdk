'use strict';

module.exports = function(AV) {
  /**
   * @namespace 包含了使用了 LeanCloud
   *  <a href='/docs/leaninsight_guide.html'>离线数据分析功能</a>的函数，本模块已经废弃，
   * 请使用 AV.Insight 。
   * <p><strong><em>
   *   部分函数仅在云引擎运行环境下有效。
   * </em></strong></p>
   */
  Object.defineProperty(AV, "BigQuery", {
    get: function() {
      console.warn("AV.BigQuery is deprecated, please use AV.Insight instead.");
      return AV.Insight;
    },
  });
};
