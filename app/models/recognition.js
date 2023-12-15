import Model, { attr, belongsTo } from '@ember-data/model';

export default class RecognitionModel extends Model {
  @attr dateDocument;
  @attr legalResource;
  @belongsTo('association', {
    inverse: 'recognitions',
    async: true,
  })
  association;
  @belongsTo('period', {
    inverse: null,
    async: true,
  })
  validityPeriod;
  @belongsTo('administrative-unit', {
    inverse: null,
    async: true,
  })
  awardedBy;
}
