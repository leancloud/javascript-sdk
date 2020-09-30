import * as Repl from 'repl';
import * as path from 'path';

import * as context from './context';

printUsage();

const repl = Repl.start('leancloud > ');
const historyPath = path.resolve(__dirname, '.history');
repl.setupHistory(historyPath, function (err) {
  if (err) {
    console.error(err);
    process.exit(-1);
  }
});

Object.assign(repl.context, context);

function printUsage() {
  console.log(`Welcome to the LeanCloud JavaScript SDK REPL!

Available Commands:

  .exit - exits the REPL

Available Classes:

  LC.App
  LC.Storage
  LC.GeoPoint
  LC.Query
  LC.Op
  LC.SearchQuery
  LC.SearchQueryBuilder
  LC.ACL
  LC.Captcha
  LC.Cloud
  LC.Push

Available Objects:

  env - current environment

`);
}
