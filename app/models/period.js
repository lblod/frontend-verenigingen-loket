import Model, { attr } from '@warp-drive/legacy/model';

export default class PeriodModel extends Model {
  @attr startTime;
  @attr endTime;
}
