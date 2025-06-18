import Joi from 'joi';

import { otherSchemas } from './otherSchemas';

export const googleSchemas = {
  code: Joi.string().required().trim().messages({
    'string.base': 'Authorization code must be a string.',
    'string.empty': 'Authorization code is required.',
    'any.required': 'Authorization code is missing from the callback.',
  }),
  state: Joi.string()
    .custom((value, helpers) => {
      try {
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded);

        const { error } = Joi.object({
          timezone: otherSchemas.timezone,
        }).validate(parsed);

        if (error) {
          return helpers.error('any.invalid', { message: error.message });
        }

        return value; // or parsed if you want to attach the decoded object
      } catch (err) {
        return helpers.error('any.invalid', { message: 'Malformed state' });
      }
    }, 'Decoded state validation')
    .messages({
      'any.invalid': 'State must be a valid encoded JSON with a valid timezone',
    }),
};
