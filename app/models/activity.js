import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class ActivityModel extends Model {
  @attr prefLabel;
  @attr notation;
  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  topConcept;
}
