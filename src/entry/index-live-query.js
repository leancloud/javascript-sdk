const AV = require('./index');
const useLiveQuery = require('./use-live-query');
const useAdatpers = require('./use-adapters');

module.exports = useAdatpers(useLiveQuery(AV));
