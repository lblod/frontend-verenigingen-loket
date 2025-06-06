import { belongsTo, attr } from '@ember-data/model';
import PublicOrganizationModel from './public-organization';

export default class AdministrativeUnitModel extends PublicOrganizationModel {
  @attr name;
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  classification;
}
