import Joi from 'joi';

const websiteRegex = /^https:\/\//;
export const errorValidation = Joi.object()
  .keys({
    dateDocument: Joi.date()
      .required()
      .messages({ 'any.required': 'Gelieve een geldige datum te kiezen' }),
    legalResource: Joi.string()
      .allow(null)
      .empty('')
      .pattern(websiteRegex, { name: 'website' })
      .messages({
        'string.pattern.base': 'Geef een geldig internetadres in',
      }),
    startTime: Joi.date()
      .required()
      .messages({ 'any.required': 'Gelieve een geldige datum te kiezen' }),
    endTime: Joi.date()
      .required()
      .messages({ 'any.required': 'Gelieve een geldige datum te kiezen' }),
  })
  .options({ abortEarly: false });
