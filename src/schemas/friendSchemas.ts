import Joi from 'joi';

import { accountSchemas } from './accountSchemas';

export const friendIdParamsSchema = Joi.object({
  friend_id: accountSchemas.user_id,
});

// POST /friend/:friend_id/request
export const friendRequestBodySchema = Joi.object({
  friend_id: accountSchemas.user_id,
});