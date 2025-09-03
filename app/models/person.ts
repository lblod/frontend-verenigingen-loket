import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { Type } from '@warp-drive/core-types/symbols';
import Joi from 'joi';
import type ContactPoint from './contact-point';
// @ts-expect-error Class isn't typed yet.
import type Site from './site';
import { isValidRijksregisternummer } from '../utils/rijksregisternummer';

export default class PersonModel extends Model {
  declare [Type]: 'person';

  @attr declare givenName?: string;
  @attr declare familyName?: string;
  // This is not a real attribute in the backend. We only use it to store data during the creation process.
  // It's not an issue since we don't use EmberData to save the data to the backend.
  @attr declare ssn?: string;

  @belongsTo<Site>('site', { inverse: null, async: true })
  declare site: Promise<Site>;

  @hasMany<ContactPoint>('contact-point', { inverse: null, async: true })
  declare contactPoints: Promise<ContactPoint[]>;
}

export const validationSchema = Joi.object({
  givenName: Joi.string().empty('').required(),
  familyName: Joi.string().empty('').required(),
  ssn: Joi.string()
    .empty('')
    .when('$isNew', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .custom((value: string, helpers: Joi.CustomHelpers<string>) => {
      if (!isValidRijksregisternummer(value)) {
        return helpers.error('string.invalid-ssn');
      }

      return value;
    }),
}).messages({
  'any.required': 'Dit veld is verplicht.',
  'string.invalid-ssn': 'Geen geldig rijksregisternummer.',
});
