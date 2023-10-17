import Model, { attr } from '@ember-data/model';

export default class ContactPointModel extends Model {
  @attr email;
  @attr telephone;
}
