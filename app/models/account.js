import Model, { attr, belongsTo } from '@ember-data/model';

export default class AccountModel extends Model {
  @attr voId;
  @attr provider;
  @belongsTo('user', { inverse: null, async: true }) user;
}
