if(typeof require !="undefined"){
  debug = require('debug')('test');
  expect = require('expect.js');
  GLOBAL.serverURL="http://192.168.1.216:3000";
  AV = require("../lib/av.js").AV;
}
AV.serverURL="https://cn-stg1.avoscloud.com";
AV._initialize('mxrb5nn3qz7drek0etojy5lh4yrwjnk485lqajnsgjwfxrb5', 'd7sbus0d81mrum4tko4t8gl74b27vl0rh762ff7ngrb6ymmq', 'l0n9wu3kwnrtf2cg1b6w2l87nphzpypgff6240d0lxui2mm4');
AV.setProduction(true);
AV._useMasterKey = true;
