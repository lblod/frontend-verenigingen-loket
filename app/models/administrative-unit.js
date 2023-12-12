import { belongsTo, attr } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
  @attr name;
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  classification;
}
