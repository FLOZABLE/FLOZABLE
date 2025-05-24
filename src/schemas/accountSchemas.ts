import Joi from 'joi';

export const accountSchemas = {
  user_id: Joi.string().length(10).messages({
    'string.empty': 'User id cannot be empty.',
  }),
  name: Joi.string().min(2).max(10).messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 20 characters.',
    'string.empty': 'Name cannot be empty.',
  }),
  timezone: Joi.string().required().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 20 characters.',
    'string.empty': 'Name cannot be empty.',
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: true } }) // allow: false means no TLD validation (e.g., .com, .org). Set to true if you want strict TLD.
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email cannot be empty.',
    }),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .messages({
      'string.empty': 'Please provide a password.',
      'string.min': 'Password is too short (8 characters minimum).',
      'string.max': 'Password is too long (20 characters maximum).',
      'string.pattern.base': 'You need special characters.',
    }),
};
