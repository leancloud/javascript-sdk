(function(root) {
  root.AV = root.AV || {};
  var AV = root.AV;
  var _ = AV._;

  /**
   * @namespace 包含了使用了 LeanCloud
   *  <a href='/docs/insight_guide.html'>离线数据分析功能</a>的函数，本模块已经废弃，
   * 请使用 AV.Insight 。
   * <p><strong><em>
   *   部分函数仅在云引擎运行环境下有效。
   * </em></strong></p>
   */
  AV.BigQuery = AV.Insight || {};
}(this));
