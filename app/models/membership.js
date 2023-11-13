import Model, { belongsTo } from '@ember-data/model';

export default class MembershipModel extends Model {
  @belongsTo('person', { inverse: null, async: true }) person;
}
