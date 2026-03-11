import Model, { attr, belongsTo } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';

export default class File extends Model {
  declare [Type]: 'file';

  @attr declare uri: string;
  @attr declare name: string;
  @attr declare format: string;
  @attr declare size: number;
  @attr declare created: string;
  @attr({ defaultValue: 'n/a' }) declare extension: string;

  get downloadLink() {
    // TODO: replace the usage of this getter with the util
    return downloadLink(this);
  }

  @belongsTo<File>('file', {
    inverse: null,
    async: false,
  })
  declare download: File;
}

export function humanReadableSize(file: File) {
  //ripped from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  const bytes = file.size;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

export function miniatureMetadata(file: File) {
  return `${file.extension.toUpperCase()} - ${humanReadableSize(file)}`;
}

export function downloadLink(file: File) {
  return `/files/${file.id}/download?name=${file.name}`;
}
