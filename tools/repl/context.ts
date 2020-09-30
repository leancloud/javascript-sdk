import * as env from '../../env';
import * as LC from '../../src/_entry/all';
import * as adapters from '@leancloud/platform-adapters-node';
import { LiveQuery } from '../../src/_entry/live-query';

LC.setAdapters(adapters);
LC.use(LiveQuery);
LC.init(env);

export { env, LC };
