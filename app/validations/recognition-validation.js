import Joi from 'joi';

const websiteRegex = /^https:\/\//;
export const errorValidation = Joi.object()
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
    delegatedTo: Joi.any().required().messages({
      'any.required':
        'Gelieve de gedelegeerde entiteit te selecteren die de erkenning toekent.',
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
