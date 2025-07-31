import Model, { attr, belongsTo } from '@ember-data/model';
import Joi from 'joi';

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

export default class ContactPointModel extends Model {
  /** @type {?'Primary'} */
  @attr type;
  /** @type {?string} */
  @attr email;
  /** @type {?string} */
  @attr telephone;
  /** @type {?string} */
  @attr name;
  /** @type {?string} */
  @attr website;

  @belongsTo('association', { async: false, inverse: 'contactPoints' })
  organization;
}

/**
 * @param {ContactPointModel} contactPoint
 * @returns {boolean}
 */
export function isPrimaryContactPoint(contactPoint) {
  return contactPoint.type === 'Primary';
}

/**
 * @param {ContactPointModel} contactPoint
 * @returns {void}
 */
export function setPrimaryContactPoint(contactPoint) {
  contactPoint.type = 'Primary';
}

/**
 * @param {ContactPointModel} contactPoint
 * @returns {void}
 */
export function unsetPrimaryContactPoint(contactPoint) {
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
