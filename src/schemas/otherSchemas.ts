import Joi from 'joi';
import JoiTimezone from 'joi-tz';

const TimezoneJoi = Joi.extend(JoiTimezone);

export const otherSchemas = {
  viewer: Joi.string().valid('day', 'week', 'month').required().messages({
    'any.required': 'Viewer is required.',
    'string.empty': 'Viewer cannot be empty.',
    'any.only': 'Viewer must be one of: day, week, or month.',
  }),
  date: Joi.string().isoDate().required().messages({
    'any.required': 'Date is required.',
    'string.empty': 'Date cannot be empty.',
    'string.isoDate': 'Date must be a valid ISO 8601 string.',
  }),
  timezone: TimezoneJoi.timezone().required(),
  like: Joi.boolean().required().messages({
    'boolean.base': 'Like must be true or false.',
    'any.required': 'Like is required.',
  }),
};
