import Model, { attr, belongsTo } from '@ember-data/model';
import Joi from 'joi';

export const AWARDED_BY_OPTIONS = {
  COLLEGE: 'College van burgemeester en schepenen',
  OTHER: 'Andere',
};

/**
 * @type {const}
 */
export const RECOGNITION_STATUS = {
  ACTIVE:
    'http://lblod.data.gift/concepts/0d2dc070-2c6d-4af3-bedc-3fd96c45bb3a',
  UPCOMING:
    'http://lblod.data.gift/concepts/61875267-3045-4da7-9e38-ca7ddb7d3e3c',
  EXPIRED:
    'http://lblod.data.gift/concepts/34ff67a0-8196-4228-937a-d3f46191c85b',
};

/**
 * @type {const}
 */
export const RECOGNITION_STATUS_LABELS = {
  [RECOGNITION_STATUS.ACTIVE]: 'Erkend',
  [RECOGNITION_STATUS.EXPIRED]: 'Verlopen',
  [RECOGNITION_STATUS.UPCOMING]: 'Toekomstig',
};

export const labelForRecognitionStatus = (uri) => {
  return RECOGNITION_STATUS_LABELS[uri];
};

export default class RecognitionModel extends Model {
  @attr dateDocument;
  @attr legalResource;
  @attr status;

  @belongsTo('association', {
    inverse: 'recognitions',
    async: true,
  })
  association;

  @belongsTo('period', {
    inverse: null,
    async: false,
  })
  validityPeriod;

  @belongsTo('public-organization', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  awardedBy;

  @belongsTo('public-organization', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  delegatedTo;

  @belongsTo('file', {
    inverse: null,
    async: true,
  })
  file;
}

const websiteRegex = /^https:\/\//;
export const validationSchema = Joi.object()
  .keys({
    dateDocument: Joi.date()
      .optional()
      .messages({ 'date.base': 'Gelieve een geldige datum te kiezen.' }),
    legalResource: Joi.alternatives().try(
      Joi.string()
        .allow(null)
        .empty('')
        .pattern(websiteRegex, { name: 'website' })
        .messages({
          'string.pattern.name': 'Geef een geldig internetadres in.',
        }),
    ),
    startTime: Joi.date().required().messages({
      'any.required': 'Gelieve een geldige ingangsdatum te kiezen.',
      'date.base': 'Gelieve een geldige ingangsdatum te kiezen.',
      'date.less':
        'Gelieve een ingangsdatum te kiezen dat voor de einddatum komt.',
    }),
    endTime: Joi.date().required().greater(Joi.ref('startTime')).messages({
      'any.required': 'Gelieve een geldige einddatum te kiezen.',
      'date.base': 'Gelieve een geldige einddatum te kiezen.',
      'date.greater':
        'Gelieve een einddatum te kiezen dat na de ingangsdatum komt.',
    }),
    awardedBy: Joi.any().required().messages({
      'any.required':
        'Gelieve de entiteit te selecteren die de erkenning toekent.',
    }),
    isDelegatedToRequired: Joi.boolean(),
    delegatedTo: Joi.when('isDelegatedToRequired', {
      is: true,
      then: Joi.required().empty(['', null]).messages({
        'any.required':
          'Gelieve de gedelegeerde entiteit in te geven die de erkenning toekent.',
        'any.empty':
          'Gelieve de gedelegeerde entiteit in te geven die de erkenning toekent.',
      }),
      otherwise: Joi.allow(null).empty(''),
    }),
    file: Joi.object()
      .allow(null)
      .custom((value, helpers) => {
        if (!(value instanceof File)) {
          return helpers.message('Gelieve een bestand te kiezen.');
        }
        if (!value.name.endsWith('.pdf')) {
          return helpers.message('Enkel een PDF-bestand is toegelaten.');
        }
        return value;
      }),
  })
  .options({ abortEarly: false });
