import * as env from '../../env';
import * as LC from '../../src';
import * as adapters from '@leancloud/platform-adapters-node';
import { LiveQuery } from '../../src/live-query';

LC.setAdapters(adapters);
LC.use(LiveQuery);
LC.init(env);

export { env, LC };
