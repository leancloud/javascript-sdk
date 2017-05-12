#!/usr/bin/env node
const assert = require('assert');
assert(require('../').version === require('../package.json').version);
assert(require('../bower.json').version === require('../package.json').version);
