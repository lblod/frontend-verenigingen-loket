import Model, { attr, belongsTo } from '@ember-data/model';

export default class RecognitionModel extends Model {
  @attr dateDocument;
  @attr legalResource;
  @attr status;
  @belongsTo('association', {
    inverse: 'recognitions',
    async: true,
  })
  association;
  @belongsTo('period', {
    inverse: null,
    async: false,
  })
  validityPeriod;
  @belongsTo('governing-body', {
    inverse: null,
    async: true,
  })
  awardedBy;
  @belongsTo('file', {
    inverse: null,
    async: true,
  })
  file;
}
