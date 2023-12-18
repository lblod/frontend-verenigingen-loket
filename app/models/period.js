import Model, { attr } from '@ember-data/model';

export default class PeriodModel extends Model {
  @attr startTime;
  @attr endTime;
}
