import Model, { attr } from '@warp-drive/legacy/model';

export default class TargetAudienceModel extends Model {
  @attr minimumLeeftijd;
  @attr maximumLeeftijd;
}
