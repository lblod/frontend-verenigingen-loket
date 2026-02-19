import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class ConceptSchemeModel extends Model {
  @attr prefLabel;
  @hasMany('concept', {
    inverse: null,
    async: true,
  })
  topConcept;
}
