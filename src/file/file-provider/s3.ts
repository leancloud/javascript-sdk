import { HTTP, HTTPResponse } from '../../http';
import { FileTokens, ProviderUploadOptions } from '../file-class';

export class AWSS3 {
  static upload(
    _: string,
    data: unknown,
    tokens: FileTokens,
    options?: ProviderUploadOptions
  ): Promise<HTTPResponse> {
    return HTTP.request({
      method: 'PUT',
      baseURL: tokens.upload_url,
      header: {
        'Content-Type': tokens.mime_type,
        'Cache-Control': 'public, max-age=31536000',
        ...options?.header,
      },
      body: data,
      options,
    });
  }
}
