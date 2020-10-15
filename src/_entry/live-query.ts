import { LiveQuery } from '../live-query';
import { getGlobalObject } from '../utils';

// Auto load
getGlobalObject('LC')?.use(LiveQuery);

export * from '../live-query';
