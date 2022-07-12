#!/usr/bin/env node
const assert = require('assert');
assert.equal(require('../').version, require('../package.json').version);
assert.equal(
  require('../package.json').version,
  require('../package-lock.json').version
);
