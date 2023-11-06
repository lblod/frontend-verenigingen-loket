import Model, { attr } from '@ember-data/model';

export default class IdentifierModel extends Model {
  @attr postalCode;
}
