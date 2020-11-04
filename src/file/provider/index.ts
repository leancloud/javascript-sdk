import type { FileProvider } from '../file-class';
import { Qiniu } from './qiniu';
import { AWSS3 } from './s3';

export function getFileProvider(name: string): FileProvider {
  switch (name) {
    case 'qiniu':
      return Qiniu;
    case 's3':
      return AWSS3;
    default:
      throw new Error('Unsupported file provider: ' + name);
  }
}
