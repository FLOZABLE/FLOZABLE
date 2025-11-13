import Joi from 'joi';

export const appleSchemas = {
  code: Joi.string().required().trim().messages({
    'string.base': 'Authorization code must be a string.',
    'string.empty': 'Authorization code is required.',
    'any.required': 'Authorization code is missing from the callback.',
  }),
  name: Joi.string().min(2).max(10).allow(null).optional().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 20 characters.',
    'string.empty': 'Name cannot be empty.',
  }),
};
