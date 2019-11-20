#!/usr/bin/env node
const assert = require('assert');
assert(require('../').version === require('../package.json').version);
