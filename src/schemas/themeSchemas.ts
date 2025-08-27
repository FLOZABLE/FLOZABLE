import Joi from 'joi';

export const themeSchema = {
  theme_id: Joi.string().length(10).messages({
    'string.empty': 'Theme id cannot be empty.',
  }),

  name: Joi.string().min(2).max(10).messages({
    'string.min': 'Theme name must be at least 2 characters long.',
    'string.max': 'Theme name cannot exceed 20 characters.',
    'string.empty': 'Theme name cannot be empty.',
  }),

  description: Joi.string().max(1000).required().trim().messages({
    'string.max': 'Description cannot exceed 1000 characters.',
    'string.empty': 'Description cannot be empty.',
    'any.required': 'Description is required.',
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

  video_id: Joi.string().length(11).messages({
    'string.empty': 'Video id cannot be empty.',
  }),
};

export const putThemeSchema = Joi.object({
  name: themeSchema.name,
  description: themeSchema.description,
  tags: themeSchema.tags,
  video_id: themeSchema.video_id,
});
