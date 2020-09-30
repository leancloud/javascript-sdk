interface URLComponents {
  scheme?: string;
  host?: string;
  port?: number;
  path?: string;
  query?: Record<string, string>;
  hash?: string;
}

export function unmarshalURL(url: string): URLComponents {
  const re = /^(?:([A-Za-z]+):)?\/{0,3}([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  const items = url.match(re);

  const components: URLComponents = {
    scheme: items[1],
    host: items[2],
    port: parseInt(items[3]),
    path: items[4],
    query: {},
    hash: items[6],
  };

  const query_str = items[5];
  if (query_str) {
    query_str.split('&').forEach((item) => {
      const [key, value] = item.split('=');
      components.query[key] = decodeURIComponent(value);
    });
  }
  return components;
}
