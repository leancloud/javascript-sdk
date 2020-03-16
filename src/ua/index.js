const version = require('../version');
const getUA = (comments = []) => {
  let ua = `LeanCloud-JS-SDK/${version}`;
  if (comments.length) {
    ua += ` (${comments.join('; ')})`;
  }
  return ua;
};
module.exports = getUA;
