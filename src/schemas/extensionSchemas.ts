import Joi from 'joi';

export const extensionSchemas = {
  website: Joi.string().min(2).max(20).required().trim().messages({
    'string.min': 'Website must be at least 2 characters long.',
    'string.max': 'Website cannot exceed 20 characters.',
    'string.empty': 'Website cannot be empty.',
    'any.required': 'Website is required.',
  }),

  block: Joi.boolean().required().messages({
    'boolean.base': 'Block must be true or false.',
    'any.required': 'Block is required.',
  }),

  study_block: Joi.boolean().required().messages({
    'boolean.base': 'Study block must be true or false.',
    'any.required': 'Study block is required.',
  }),

  timer: Joi.boolean().required().messages({
    'boolean.base': 'Timer must be true or false.',
    'any.required': 'Timer is required.',
  }),

  study_timer: Joi.boolean().required().messages({
    'boolean.base': 'Study timer must be true or false.',
    'any.required': 'Study timer is required.',
  }),
};

export const putExtensionSettingSchema = Joi.object({
  website: extensionSchemas.website,
  block: extensionSchemas.block,
  study_block: extensionSchemas.study_block,
  timer: extensionSchemas.timer,
  study_timer: extensionSchemas.study_timer,
});
