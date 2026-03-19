import Model, { attr, belongsTo } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';
import type File from './file';

export const STATUS = {
  SCHEDULED: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled',
  BUSY: 'http://redpencil.data.gift/id/concept/JobStatus/busy',
  SUCCESS: 'http://redpencil.data.gift/id/concept/JobStatus/success',
  FAILED: 'http://redpencil.data.gift/id/concept/JobStatus/failed',
} as const;

export default class Job extends Model {
  declare [Type]: 'job';

  @attr declare status: (typeof STATUS)[keyof typeof STATUS];
  @attr('date') declare created: Date;
  @attr('date') declare modified: Date;
  @attr declare operation: string;
  @attr declare error: string;

  @belongsTo<File>('file', {
    inverse: null,
    async: false,
  })
  declare resultsContainer: File;
}
