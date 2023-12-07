import Model, { belongsTo } from '@ember-data/model';

export default class RecognitionModel extends Model {
  @belongsTo('validity-period', {
    inverse: null,
    async: true,
  })
  validityPeriod;
  @belongsTo('awarded-by', {
    inverse: null,
    async: true,
  })
  awardedBy;
}
