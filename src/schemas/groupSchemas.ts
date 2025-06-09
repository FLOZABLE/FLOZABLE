import Joi from 'joi';

export const groupSchemas = {
  group_id: Joi.string().length(10).messages({
    'string.empty': 'Group id cannot be empty.',
  }),
  name: Joi.string().min(2).max(10).messages({
    'string.min': 'Group name must be at least 2 characters long.',
    'string.max': 'Group name cannot exceed 20 characters.',
    'string.empty': 'Group name cannot be empty.',
  }),
  password: Joi.string().min(5).max(20).allow('', null).messages({
    'string.empty': 'Please provide a password.',
    'string.min': 'Password is too short (5 characters minimum).',
    'string.max': 'Password is too long (20 characters maximum).',
  }),
};

export const postJoinGroupSchema = Joi.object({
  group_id: groupSchemas.group_id,
  password: groupSchemas.password,
});
