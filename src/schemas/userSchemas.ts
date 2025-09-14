import Joi from 'joi';

import { accountSchemas } from './accountSchemas';
import { otherSchemas } from './otherSchemas';

export const userIdParamsSchema = Joi.object({
  user_id: accountSchemas.user_id,
});

export const getUserProfileQuerySchema = Joi.object({
  timezone: otherSchemas.timezone,
});

export const getUserStatusQuerySchema = Joi.object({
  timezone: otherSchemas.timezone,
});
