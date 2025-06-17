import Joi from 'joi';

import { otherSchemas } from './otherSchemas';

export const groupSchemas = {
  group_id: Joi.string().length(10).required().trim().messages({
    'string.length': 'Group id must be exactly 10 characters.',
    'string.empty': 'Group id cannot be empty.',
    'any.required': 'Group id is required.',
  }),

  name: Joi.string().min(2).max(20).required().trim().messages({
    'string.min': 'Group name must be at least 2 characters long.',
    'string.max': 'Group name cannot exceed 20 characters.',
    'string.empty': 'Group name cannot be empty.',
    'any.required': 'Group name is required.',
  }),

  password: Joi.string().min(5).max(20).required().messages({
    'string.empty': 'Please provide a password.',
    'string.min': 'Password is too short (5 characters minimum).',
    'string.max': 'Password is too long (20 characters maximum).',
    'any.required': 'Password is required.',
  }),

  description: Joi.string().max(1000).required().trim().messages({
    'string.max': 'Description cannot exceed 1000 characters.',
    'string.empty': 'Description cannot be empty.',
    'any.required': 'Description is required.',
  }),

  max_members: Joi.number().integer().min(1).max(50).required().messages({
    'number.base': 'Max members must be a number.',
    'number.integer': 'Max members must be an integer.',
    'number.min': 'Max members must be at least 1.',
    'number.max': 'Max members cannot exceed 50.',
    'any.required': 'Max members is required.',
  }),

  tags: Joi.array()
    .items(Joi.string().min(1).max(50))
    .max(50)
    .required()
    .messages({
      'array.base': 'Tags must be an array of strings.',
      'array.max': 'You can specify up to 50 tags.',
      'any.required': 'Tags are required.',
    }),

  color: Joi.string().max(20).required().trim().messages({
    'string.max': 'Color cannot exceed 20 characters.',
    'string.empty': 'Color cannot be empty.',
    'any.required': 'Color is required.',
  }),

  goal_hr: Joi.number().integer().min(1).max(12).required().messages({
    'number.base': 'Goal hour must be a number.',
    'number.integer': 'Goal hour must be an integer.',
    'number.min': 'Goal hour must be at least 1.',
    'number.max': 'Goal hour cannot exceed 12.',
    'any.required': 'Goal hour is required.',
  }),

  visibility: Joi.boolean().required().messages({
    'boolean.base': 'Visibility must be true or false.',
    'any.required': 'Visibility is required.',
  }),
};

export const postGroupJoinParamsSchema = Joi.object({
  group_id: groupSchemas.group_id,
});

export const postGroupJoinBodySchema = Joi.object({
  password: groupSchemas.password,
});

export const postGroupLikeParamsSchema = Joi.object({
  group_id: groupSchemas.group_id,
});

export const postGroupLikeBodySchema = Joi.object({
  like: otherSchemas.like,
});

export const putGroupSchema = Joi.object({
  name: groupSchemas.name,
  password: Joi.when('visibility', {
    is: false,
    then: groupSchemas.password,
    otherwise: Joi.string().allow('', null).optional(),
  }),
  description: groupSchemas.description,
  max_members: groupSchemas.max_members,
  tags: groupSchemas.tags,
  color: groupSchemas.color,
  goal_hr: groupSchemas.goal_hr,
  visibility: groupSchemas.visibility,
});

export const getGroupMembersParamsSchema = Joi.object({
  group_id: groupSchemas.group_id,
});

export const getGroupMembersQuerySchema = Joi.object({
  timezone: otherSchemas.timezone,
});
