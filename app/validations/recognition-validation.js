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
    awardedBy: Joi.string().messages({
      'string.empty':
        'Gelieve de entiteit in te vullen die de erkenning toekent.',
      'string.base':
        'Gelieve de entiteit in te vullen die de erkenning toekent.',
    }),
    file: Joi.any().messages({}),
  })
  .options({ abortEarly: false });
