import Model, { belongsTo, attr } from '@warp-drive/legacy/model';

export default class GoverningBodyModel extends Model {
  @attr('date') start;
  @attr('date') end;

  // Governing body "in time" -> Governing body
  @belongsTo('governing-body', {
    async: false,
    inverse: null,
  })
  governingBody;

  @belongsTo('administrative-unit', {
    async: false,
    inverse: null,
  })
  administrativeUnit;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  classification;
}
