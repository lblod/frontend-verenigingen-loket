import Model, { attr, belongsTo } from '@ember-data/model';
import Joi from 'joi';
import type { Type } from '@warp-drive/core-types/symbols';
// @ts-expect-error Association isn't typed yet.
import type Association from './association';

// The `.name` property is used to determine the type of data that is stored in the contact point.
// This is different from the `type` property, which is used to mark a contact point as the "primary" of a certain (name) type.
export const CONTACT_DATA_TYPE = {
  EMAIL: 'E-mail',
  TELEPHONE: 'Telefoon',
  WEBSITE: 'Website',
  SOCIAL_MEDIA: 'SocialMedia',
};

export const CONTACT_POINT_LABEL = {
  [CONTACT_DATA_TYPE.EMAIL]: 'E-mail',
  [CONTACT_DATA_TYPE.TELEPHONE]: 'Telefoon',
  [CONTACT_DATA_TYPE.WEBSITE]: 'Website',
  [CONTACT_DATA_TYPE.SOCIAL_MEDIA]: 'Social media',
};

export default class ContactPoint extends Model {
  declare [Type]: 'contact-point';

  @attr type?: 'Primary' | null;
  @attr email?: string;
  @attr telephone?: string;
  @attr name?: string;
  @attr website?: string;

  @belongsTo<Association>('association', {
    async: false,
    inverse: 'contactPoints',
  })
  organization?: Association;
}

export function isPrimaryContactPoint(contactPoint: ContactPoint) {
  return contactPoint.type === 'Primary';
}

export function setPrimaryContactPoint(contactPoint: ContactPoint) {
  contactPoint.type = 'Primary';
}

export function unsetPrimaryContactPoint(contactPoint: ContactPoint) {
  contactPoint.type = null;
}

export const validationSchema = Joi.object({
  name: Joi.string()
    .valid(...Object.values(CONTACT_DATA_TYPE))
    .required(),
  email: Joi.string()
    .empty('')
    .email({ tlds: false })
    .when('name', {
      is: CONTACT_DATA_TYPE.EMAIL,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'string.email': 'Geef een geldig e-mailadres in.',
    }),
  telephone: Joi.string()
    .empty('')
    .regex(/^(tel:)?\+?[0-9]*$/)
    .messages({
      'string.pattern.base': 'Enkel een plusteken en cijfers zijn toegelaten.',
    })
    .when('name', {
      is: CONTACT_DATA_TYPE.TELEPHONE,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  website: Joi.string()
    .empty('')
    .uri()
    .when('name', {
      switch: [
        { is: CONTACT_DATA_TYPE.WEBSITE, then: Joi.required() },
        { is: CONTACT_DATA_TYPE.SOCIAL_MEDIA, then: Joi.required() },
      ],
      otherwise: Joi.optional(),
    })
    .messages({ 'string.uri': 'Geef een geldig internetadres in.' }),
}).messages({
  'any.required': 'Dit veld is verplicht.',
});
