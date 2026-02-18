import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class ChangeEventModel extends Model {
  @attr date;
  @belongsTo('association', { inverse: null, async: true }) association;
  @belongsTo('change', { inverse: null, async: true }) type;
  @belongsTo('change', { inverse: null, async: true }) result;
}
