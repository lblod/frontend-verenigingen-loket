import Model, { attr, belongsTo } from '@ember-data/model';

export default class ActivityModel extends Model {
  @attr prefLabel;
  @attr notation;
  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  topConcept;
}
