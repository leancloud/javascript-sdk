const version = require('../version');
const comments = [process.env.PLATFORM || 'Node.js'].concat(require('./comments'));

module.exports = `LeanCloud-JS-SDK/${version} (${comments.join('; ')})`;
