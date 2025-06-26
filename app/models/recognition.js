import Model, { attr, belongsTo } from '@ember-data/model';

export const AWARDED_BY_OPTIONS = {
  COLLEGE: 'College van burgemeester en schepenen',
  OTHER: 'Andere',
};

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

  @belongsTo('public-organization', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  awardedBy;

  @belongsTo('public-organization', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  delegatedTo;

  @belongsTo('file', {
    inverse: null,
    async: true,
  })
  file;
}
