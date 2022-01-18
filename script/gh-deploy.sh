#!/bin/sh
echo "Deploy docs to github pages.";
git checkout --orphan gh-pages;
git reset HEAD -- .;
npm run docs;
git add -f dist/av* docs demo
git config user.name "leancloud-bot";
git config user.email "ci@leancloud.cn";
git commit -m "Deploy docs and demos to Github Pages [skip ci]";
git push -qf origin gh-pages;
echo "done.";
