import Model, { attr, belongsTo } from '@ember-data/model';

export const AWARDED_BY_OPTIONS = {
  COLLEGE: 'College van burgemeester en schepenen',
  OTHER: 'Andere',
};

export const RECOGNITION_STATUS = {
  RECOGNIZED: 'Erkend',
  EXPIRED: 'Verlopen',
  UPCOMING: 'Toekomstig',
};

/**
 * @type {const}
 */
export const RECOGNITION_STATUS_URIS = {
  ACTIVE:
    'http://lblod.data.gift/concepts/0d2dc070-2c6d-4af3-bedc-3fd96c45bb3a',
  UPCOMING:
    'http://lblod.data.gift/concepts/61875267-3045-4da7-9e38-ca7ddb7d3e3c',
  EXPIRED:
    'http://lblod.data.gift/concepts/34ff67a0-8196-4228-937a-d3f46191c85b',
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
