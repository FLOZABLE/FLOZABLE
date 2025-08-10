import Joi from 'joi';

export const deviceSchemas = {
  device_id: Joi.string().max(40).messages({
    'string.empty': 'Device ID cannot be empty.',
    'string.max': 'Device ID cannot exceed 40 characters.',
  }),

  user_id: Joi.string().length(10).messages({
    'string.empty': 'User ID cannot be empty.',
    'string.length': 'User ID must be exactly 10 characters.',
  }),

  created_at: Joi.number().integer().messages({
    'number.base': 'Created at must be a valid integer timestamp.',
    'any.required': 'Created at is required.',
  }),

  name: Joi.string().max(30).allow(null).messages({
    'string.max': 'Device name cannot exceed 30 characters.',
  }),

  brand: Joi.string().max(30).allow(null).messages({
    'string.max': 'Device brand cannot exceed 30 characters.',
  }),

  token: Joi.string().max(20).messages({
    'string.empty': 'Token cannot be empty.',
    'string.max': 'Token cannot exceed 20 characters.',
  }),

  notification_token: Joi.string().max(60).allow(null).messages({
    'string.max': 'Notification token cannot exceed 60 characters.',
  }),
};
