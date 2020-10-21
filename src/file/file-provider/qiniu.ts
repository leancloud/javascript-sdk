import { HTTP, HTTPResponse } from '../../http';
import { FileTokens, ProviderUploadOptions } from '../file-class';

export class Qiniu {
  static upload(
    name: string,
    data: unknown,
    tokens: FileTokens,
    options?: ProviderUploadOptions
  ): Promise<HTTPResponse> {
    return HTTP.upload({
      method: 'POST',
      baseURL: tokens.upload_url,
      file: { name, data, field: 'file' },
      form: { name, key: tokens.key, token: tokens.token },
      header: options?.header,
      options,
    });
  }
}
