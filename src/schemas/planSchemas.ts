import Joi from 'joi';

import { otherSchemas } from './otherSchemas';

export const planSchemas = {
  id: Joi.string().required().messages({
    'string.base': 'Plan ID must be a string.',
    'any.required': 'Plan ID is required.',
  }),
  title: Joi.string().max(100).messages({
    'string.max': 'Title cannot exceed 100 characters.',
    'string.empty': 'Title cannot be empty.',
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description cannot exceed 1000 characters.',
  }),
  start: Joi.date().iso().required().messages({
    'date.format': 'Start time must be a valid ISO 8601 date string.',
    'any.required': 'Start time is required.',
  }),
  end: Joi.date().iso().required().messages({
    'date.format': 'End time must be a valid ISO 8601 date string.',
    'any.required': 'End time is required.',
  }),
  all_day: Joi.boolean().required().messages({
    'boolean.base': 'All-day must be a boolean value.',
    'any.required': 'All-day field is required.',
  }),
  calendar_id: Joi.string().required().messages({
    'string.base': 'Calendar ID must be a string.',
    'any.required': 'Calendar ID is required.',
  }),
  editable: Joi.boolean().optional(),
  html_link: Joi.string().uri().optional().messages({
    'string.uri': 'HTML link must be a valid URI.',
  }),
  background_color: Joi.string().optional(),
};

export const planSchema = Joi.object({
  id: planSchemas.id,
  title: planSchemas.title,
  description: planSchemas.description,
  start: planSchemas.start,
  end: planSchemas.end,
  all_day: planSchemas.all_day,
  calendar_id: planSchemas.calendar_id,
  editable: planSchemas.editable,
  html_link: planSchemas.html_link,
  background_color: planSchemas.background_color,
})
  .required()
  .messages({
    'object.base': 'Plan must be an object.',
    'any.required': 'Plan is required.',
  });

export const getPlanAllSchema = Joi.object({
  date: otherSchemas.date,
});

export const patchPlanParamsSchema = Joi.object({
  plan_id: planSchemas.id,
});

export const patchPlanBodySchema = Joi.object({
  plan: planSchema,
});

export const deletePlanParamsSchema = Joi.object({
  plan_id: planSchemas.id,
});

export const deletePlanBodySchema = Joi.object({
  calendar_id: planSchemas.calendar_id,
});
