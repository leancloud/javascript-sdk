// base64 character set, plus padding character (=)
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = string => {
  let result = '';

  for (let i = 0; i < string.length; ) {
    const a = string.charCodeAt(i++);
    const b = string.charCodeAt(i++);
    const c = string.charCodeAt(i++);
    if (a > 255 || b > 255 || c > 255) {
      throw new TypeError(
        'Failed to encode base64: The string to be encoded contains characters outside of the Latin1 range.'
      );
    }

    const bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64.charAt((bitmap >> 18) & 63) +
      b64.charAt((bitmap >> 12) & 63) +
      b64.charAt((bitmap >> 6) & 63) +
      b64.charAt(bitmap & 63);
  }

  // To determine the final padding
  const rest = string.length % 3;
  // If there's need of padding, replace the last 'A's with equal signs
  return rest ? result.slice(0, rest - 3) + '==='.substring(rest) : result;
};
