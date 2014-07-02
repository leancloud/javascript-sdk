if(typeof require !="undefined"){
	expect = require('expect.js');
	GLOBAL.serverURL="http://192.168.1.216:3000";
	AV = require("../lib/av.js").AV;
}
AV.serverURL="https://cn-stg1.avoscloud.com";
AV._initialize('mxrb5nn3qz7drek0etojy5lh4yrwjnk485lqajnsgjwfxrb5', 'd7sbus0d81mrum4tko4t8gl74b27vl0rh762ff7ngrb6ymmq', 'l0n9wu3kwnrtf2cg1b6w2l87nphzpypgff6240d0lxui2mm4');
//AV._initialize('blxzylt2g5e8l09zt875hl82nb8clydmvdjotv7ouudltkhj', 'ny0cwned258af60y6epsic72ge368zbnal4rmk7p0knu079o', 'ceotnbt1o1hpvjrr4oh8f8ykrxin973acc0b2hxi62e4f0bi');
//AV._initialize("a6jku4sqdxbgidzrxsy8u30evp8nltry2af4atncwg5br0qi","85gi8j21v7l5li9kquh3oy900macawjs4leyx8n788k7z4qy","5cy3lnf97bkznd9su76t05qi6zuzoygxbgtik4egsd9wtl2j");
AV._useMasterKey = true;
if(typeof require !="undefined"){
	require("./file.js")
}
