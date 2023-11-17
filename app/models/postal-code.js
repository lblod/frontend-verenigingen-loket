import Model, { attr } from '@ember-data/model';

export default class PostalCodeModel extends Model {
  @attr postalCode;
  @attr postalName;
}
