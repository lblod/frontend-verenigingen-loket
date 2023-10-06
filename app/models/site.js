import Model, { belongsTo } from '@ember-data/model';

export default class SiteModel extends Model {
  @belongsTo('address', { inverse: null, async: true }) address;
}
