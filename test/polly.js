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

const pollyEnabled = () => {
  return (
    typeof process !== 'undefined' &&
    process &&
    process.env &&
    process.env.REAL_BACKEND === undefined &&
    process.env.NODE_ENV !== undefined
  );
};

export const setupPolly = () => {
  return pollyEnabled() && setupMocha(pollyOpt);
};

const beforeEach = () => {
  return pollyEnabled() && setupMocha.beforeEach(pollyOpt);
};

const afterEach = () => {
  return pollyEnabled() && setupMocha.afterEach();
};

export default { beforeEach, afterEach };
