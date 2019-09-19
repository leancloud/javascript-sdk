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
    headers: false,
    url: {
      protocol: false,
      username: false,
      password: false,
      hostname: false,
      port: false,
      pathname: true,
      query: true,
      hash: false,
    },
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
