if [ $# != 1 ] ; then
	echo "USAGE: $0 VERSION"
	echo " e.g.: $0 0.2.1"
	exit 1;
fi

echo "mkdir dist"
rm -rf dist/
mkdir dist
echo 'compress lib/av.js ...'
curl -X POST -s --data-urlencode 'input@lib/av.js' http://javascript-minifier.com/raw > dist/av-mini.js
cp lib/av.js dist/
cd dist/
tar zcvf avos-javascript-sdk-$1.tar.gz ./*.js
cd ..
mkdir -p dist/js-sdk-api-docs
export JSDOCDIR=tools/jsdoc-toolkit/
sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc lib/av_merged.js
tar zcvf dist/js-sdk-api-docs-$1.tar.gz dist/js-sdk-api-docs
echo 'done'

