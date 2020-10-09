#!/bin/sh
echo "Deploy docs to github pages.";
npm run docs;
mkdir gh_pages;
cp -r docs gh_pages/;
mkdir gh_pages/dist;
cp -r dist/av* gh_pages/dist/;
cp -r demo gh_pages/;

echo "Deploy doss(v5) to github pages."
npm install -g typedoc@0.19
git checkout v5
rm -rf docs
typedoc --options typedoc.json
cp -r docs gh-pages/docs-v5

cd gh_pages && git init;
git config user.name "leancloud-bot";
git config user.email "ci@leancloud.cn";
git add .;
git commit -m "Deploy docs and demos to Github Pages [skip ci]";
git push -qf https://${TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git master:gh-pages;
echo "done.";
cd ..
