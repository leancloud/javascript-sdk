/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const AVRequest = require('./request').request;
const getUniqueId = require('./utils').getUniqueId;
const now = require('./utils').now;
const localStorage = require('./localstorage');

let win = {};
if (typeof(window) !== 'undefined') {
  win = window;
}

const getId = () => {
  const key = 'leancloud-analytics-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = getUniqueId();
    localStorage.setItem(key, id);
  }
  return id;
};

const analyseObj = {
  /**
   * 发送自定义统计事件
   * @param {Object} [options] 传入的设置项
   * @param {String} [options.version] 自定义的版本号，用来区分当前产品版本
   * @param {String} [options.channel] 自定义的渠道名称，用来区分当前产品渠道
   * @param {String} [options.event] 自定义的事件名，用来自定义一个统计事件，相当于一类统计的标题
   * @param {Object} [options.attr] 自定义的属性，可以传入任意的 Object，携带自定义的更多统计信息
   * @param {Number} [options.duration] 传入毫秒数访问时长，表示该次事件的持续时长
   * @return {Promise}
  */
  send(options) {
    // 应用版本
    const appVersion = options.version || null;

    // 推广渠道
    const appChannel = options.channel || null;

    if (!options || !options.event) {
      throw new Error('AV.Analyse send eventObject must have a event value.');
    }

    const eventObj = {
      // 事件名称
      event: options.event,

      // 事件属性，完全自定义
      attributes: options.attr,

      // 持续时长，单位毫秒
      duration: options.duration,

      // LeanCloud 内部使用
      tag: options.tag,
    };

    const data = {
      client: {
        // 服务器端会统一按照小写字母校验
        platform: 'web',
        id: getId(),
        app_version: appVersion,
        app_channel: appChannel,
      },
      session: {
        id: getId(),
      },
      events: [eventObj],
    };

    return AVRequest('stats', null, null, 'post', data);
  },
};

const pageView = () => {
  let startTime;
  let endTime;
  let page;

  const start = () => {
    startTime = now();
    page = win.location.href;
  };

  const end = () => {
    endTime = now();
    analyseObj.send({
      // 必须为 _page 表示一次页面访问
      event: '_page',

      // 页面停留时间，单位毫秒
      duration: endTime - startTime,

      // 页面名称
      tag: page,
    });
  };

  // 默认自动启动
  start();

  // 监听 url 变化（包括 hash 变化）
  win.addEventListener('hashchange', () => {
    // 页面发生变化，发送一次页面统计
    end();
    // 再次启动新的统计
    start();
  });

  // 当页面关闭的时候
  win.addEventListener('beforeunload', () => {
    // 发送一次
    end();
  });
};

// 自动统计一次 session 周期的时间
const sessionView = () => {
  const startTime = now();
  win.addEventListener('beforeunload', () => {
    const endTime = now();
    analyseObj.send({
      // 必须为 _session.close 表示一次使用结束
      event: '_session.close',

      // 使用时长，单位毫秒
      duration: endTime - startTime,
    });
  });
};

if (win.addEventListener) {
  // 启动自动页面时长统计
  pageView();

  // 启动自动 session 时长统计
  sessionView();
}

module.exports = analyseObj;
