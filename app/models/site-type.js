import Model, { attr } from '@ember-data/model';

export default class SiteTypeModel extends Model {
  @attr uri;
  @attr label;
}
