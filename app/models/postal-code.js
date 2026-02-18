import Model, { attr } from '@warp-drive/legacy/model';

export default class PostalCodeModel extends Model {
  @attr postalCode;
  @attr postalName;
}
