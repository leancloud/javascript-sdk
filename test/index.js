require('should');
require('./test.js');
require('./av.js');

require('./acl.js');
require('./cache');
require('./cloud.js');
require('./conversation.js');
require('./error.js');
require('./geopoints.js');
require('./hooks.js');
require('./leaderboard.js');
require('./object.js');
require('./query.js');
require('./role.js');
require('./search.js');
require('./sms.js');
require('./status.js');
require('./user.js');

if (process.env.REAL_BACKEND !== undefined) {
  require('./file.js');
}

// require('./captcha.js');
