import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptSchemeModel extends Model {
  @attr prefLabel;
  @hasMany('concept', {
    inverse: null,
    async: true,
  })
  topConcept;
}
