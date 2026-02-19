import { belongsTo, attr } from '@warp-drive/legacy/model';
import { Type } from '@warp-drive/core/types/symbols';
import PublicOrganizationModel from './public-organization';
import type AdministrativeUnitClassificationCode from './administrative-unit-classification-code';

export default class AdministrativeUnit extends PublicOrganizationModel {
  declare [Type]: 'administrative-unit';

  @attr declare name: string;
  @attr declare securitySchemeUrl?: string;

  @belongsTo<AdministrativeUnitClassificationCode>(
    'administrative-unit-classification-code',
    {
      inverse: null,
      async: true,
    },
  )
  declare classification: Promise<AdministrativeUnitClassificationCode>;
}
