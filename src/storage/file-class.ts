import { decode as base64ToArrayBuffer } from 'base64-arraybuffer';
import { Class } from './class';
import { App, AuthOptions } from '../app/app';
import { API_VERSION } from '../const';
import { HTTPResponse } from '../app/http';
import { Qiniu } from './file-provider/qiniu';
import { ACL } from './acl';
import { AWSS3 } from './file-provider/s3';
import { FileObjectRef, FileObject, FileData } from './file';

/**
 * @internal
 */
export interface ProviderUploadOptions extends AuthOptions {
  header?: Record<string, string>; // send to file provider
}

interface UploadOptions extends ProviderUploadOptions {
  ACL?: ACL;
  mime?: string;
  metaData?: Record<string, unknown>;
}

/**
 * @internal
 */
export interface FileTokens {
  objectId: string;
  createdAt: string;
  token: string;
  url: string;
  mime_type: string;
  provider: string;
  upload_url: string;
  bucket: string;
  key: string;
}

/**
 * @internal
 */
export interface FileProvider {
  upload(
    name: string,
    data: unknown,
    tokens: FileTokens,
    options?: UploadOptions
  ): Promise<HTTPResponse>;
}

/**
 * @internal
 */
function base64InDataURLs(urls: string): string {
  if (urls.startsWith('data:')) {
    const [meta, data] = urls.split(',');
    if (meta?.endsWith('base64')) {
      return data;
    }
  }
  return urls;
}

/**
 * @alias File
 */
export class FileClass extends Class {
  constructor(app?: App) {
    super('_File', app);
  }

  static object(id: string): FileObjectRef {
    return new FileObjectRef(App.default, id);
  }

  static upload(name: string, data: unknown, options?: UploadOptions): Promise<FileObject> {
    return new FileClass().upload(name, data, options);
  }

  static uploadWithURL(name: string, url: string, options?: UploadOptions): Promise<FileObject> {
    return new FileClass().uploadWithURL(name, url, options);
  }

  object(id: string): FileObjectRef {
    return new FileObjectRef(this.app, id);
  }

  async upload(name: string, data: unknown, options?: UploadOptions): Promise<FileObject> {
    data = this._parseFileData(data);
    const metaData: Record<string, unknown> = { ...options?.metaData };

    if (options?.sessionToken) {
      metaData.owner = options.sessionToken;
    } else {
      metaData.owner = await this.app.getSessionTokenAsync();
    }
    if (!metaData.owner) {
      metaData.owner = 'unknown';
    }
    if (!metaData.size) {
      metaData.size = this._getFileSize(data);
    }

    const tokens = await this._getFileTokens(name, options?.mime, options?.ACL, metaData);
    const provider = this._getFileProvider(tokens.provider);
    try {
      await provider.upload(name, data, tokens, options);
      await this._invokeFileCallback(tokens.token, true);
    } catch (err) {
      await this._invokeFileCallback(tokens.token, false);
      throw err;
    }

    const file = new FileObject(this.app, tokens.objectId);
    file.data = {
      ...tokens,
      name,
      metaData,
    };
    file.createdAt = new Date(tokens.createdAt);
    file.updatedAt = file.createdAt;
    delete file.data.createdAt;
    return file;
  }

  async uploadWithURL(name: string, url: string, options?: UploadOptions): Promise<FileObject> {
    const metaData: Record<string, unknown> = {
      ...options?.metaData,
      __source: 'external',
    };

    if (options?.sessionToken) {
      metaData.owner = options.sessionToken;
    } else {
      metaData.owner = await this.app.getSessionTokenAsync();
    }
    if (!metaData.owner) {
      metaData.owner = 'unknown';
    }

    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/files/${name}`,
      body: {
        name,
        url,
        ACL: options?.ACL,
        mime_type: options?.mime,
        metaData,
      },
    });

    const file = new FileObject(this.app, res.body['objectId']);
    file.data = {
      ...(res.body as FileData),
      metaData,
    };
    file.createdAt = new Date(file.data['createdAt'] as string);
    file.updatedAt = file.createdAt;
    delete file.data.createdAt;
    return file;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _parseFileData(data: any): unknown {
    if (Array.isArray(data)) {
      const u8arr = new Uint8Array(data.length);
      data.forEach((v, i) => (u8arr[i] = v));
      if (typeof Blob !== 'undefined') {
        return new Blob([u8arr]);
      }
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(u8arr);
      }
      throw new Error('Current platform cannot upload byte array encoded file');
    }

    if (data.base64) {
      const base64 = base64InDataURLs(data.base64);
      if (typeof Blob !== 'undefined') {
        return new Blob([base64ToArrayBuffer(base64)]);
      }
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(base64, 'base64');
      }
      throw new Error('Current platform cannot upload base64 encoded file');
    }

    if (data.blob) {
      return data.blob;
    }
    return data;
  }

  private _getFileSize(data: unknown): number {
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      return data.size;
    }
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
      return data.length;
    }
  }

  private async _getFileTokens(
    name: string,
    mime?: string,
    ACL?: ACL,
    metaData?: Record<string, unknown>
  ): Promise<FileTokens> {
    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/fileTokens`,
      body: {
        name,
        ACL,
        metaData,
        mime_type: mime,
      },
    });
    return res.body as FileTokens;
  }

  private _getFileProvider(name: string): FileProvider {
    switch (name) {
      case 'qiniu':
        return Qiniu;
      case 's3':
        return AWSS3;
      default:
        throw new Error('Unsupported file provider: ' + name);
    }
  }

  private _invokeFileCallback(token: string, success: boolean): Promise<HTTPResponse> {
    return this.app.request({
      method: 'POST',
      path: `${API_VERSION}/fileCallback`,
      body: { token, result: success },
    });
  }
}
