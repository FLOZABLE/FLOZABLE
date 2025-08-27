import Joi from 'joi';

export const subjectSchemas = {
  subject_id: Joi.string().length(10).messages({
    'string.empty': 'Subject id cannot be empty.',
  }),
  name: Joi.string().min(2).max(10).messages({
    'string.min': 'Subject name must be at least 2 characters long.',
    'string.max': 'Subject name cannot exceed 20 characters.',
    'string.empty': 'Subject name cannot be empty.',
  }),
  color: Joi.string().min(3).max(20).messages({
    'string.min': 'Subject color must be at least 3 characters long.',
    'string.max': 'Subject color cannot exceed 20 characters.',
    'string.empty': 'Subject color cannot be empty.',
  }),
};

export const putSubjectSchema = Joi.object({
  name: subjectSchemas.name,
  color: subjectSchemas.color,
});
