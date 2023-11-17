import Model, { attr } from '@ember-data/model';

export default class TargetAudienceModel extends Model {
  @attr minimumLeeftijd;
  @attr maximumLeeftijd;
}
