#!/bin/bash
echo "Deploy dist to dist branch.";
REV=`git rev-parse HEAD`;
BRANCH=`git rev-parse --abbrev-ref HEAD`;
DIST_BRANCH=${1:-dist};
test "$(git config user.name)" = '' && (
  git config user.name "leancloud-bot";
  git config user.email "ci@leancloud.cn";
)
git add dist -f;
git commit -m "chore(build): build ${REV} [skip ci]";
git push -qf origin ${BRANCH}:${DIST_BRANCH} > /dev/null 2>&1;
git reset HEAD~1;
echo "done.";
