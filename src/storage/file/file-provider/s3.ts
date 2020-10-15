import { FileTokens, ProviderUploadOptions } from '../file-class';
import { HTTPResponse } from '../../../app/http';
import { request } from '../../../app/http';

export class AWSS3 {
  static upload(
    _: string,
    data: unknown,
    tokens: FileTokens,
    options?: ProviderUploadOptions
  ): Promise<HTTPResponse> {
    return request({
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
