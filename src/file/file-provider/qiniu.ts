import { HTTPResponse, upload, UploadRequest } from '../../app/http';
import { FileTokens, ProviderUploadOptions } from '../file-class';

export class Qiniu {
  static upload(
    name: string,
    data: unknown,
    tokens: FileTokens,
    options?: ProviderUploadOptions
  ): Promise<HTTPResponse> {
    const req: UploadRequest = {
      method: 'POST',
      header: options?.header,
      baseURL: tokens.upload_url,
      form: {
        name,
        key: tokens.key,
        token: tokens.token,
      },
      options,
    };
    return upload(req, { field: 'file', name, data });
  }
}
