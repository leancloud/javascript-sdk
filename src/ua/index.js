const version = require('../version');
const comments = [process.env.CLIENT_PLATFORM || 'Node.js'].concat(
  require('./comments')
);

module.exports = `LeanCloud-JS-SDK/${version} (${comments.join('; ')})`;
