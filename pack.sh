#!/bin/bash

echo "Packing npm  package..."

rm -rf dist/
rm -rf node_modules/
rm -rf ./*.tgz
rm -rf ./tools
npm pack
git checkout -- ./
