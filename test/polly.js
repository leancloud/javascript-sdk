import { Polly, setupMocha } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

const pollyOpt = {
  adapters: ['node-http'],
  persister: 'fs',
  recordFailedRequests: true,
  matchRequestsBy: {
    headers: {
      exclude: ['x-lc-sign'],
    },
    // headers => {
    //   delete headers['x-lc-sign'];
    //   //console.log(headers);
    //   return headers;
    // },
    // body: body => {
    //   console.log(body);
    //   return body;
    // },
    // {
    //   exclude: ['x-lc-sign', 'x-lc-session'],
    // },
  },
};

export const setupPolly = () => {
  setupMocha(pollyOpt);
};

const beforeEach = () => {
  setupMocha.beforeEach(pollyOpt);
};

const afterEach = () => {
  setupMocha.afterEach();
};

export default { beforeEach, afterEach };
