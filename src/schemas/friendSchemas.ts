import Joi from 'joi';

import { accountSchemas } from './accountSchemas';
import { otherSchemas } from './otherSchemas';

export const friendSchemas = {
  friendship_id: Joi.string().length(10).messages({
    'string.empty': 'Friendship id cannot be empty.',
  }),
  accepted: Joi.boolean().required().messages({
    'boolean.base': 'Accepted must be true or false.',
    'any.required': 'Accepted is required.',
  }),
};

export const friendshipIdParamsSchema = Joi.object({
  friendship_id: friendSchemas.friendship_id,
});

export const friendIdParamsSchema = Joi.object({
  friend_id: accountSchemas.user_id,
});

// GET /friend/all/status
export const getFriendAllStatusSchema = Joi.object({
  timezone: otherSchemas.timezone,
});

// GET /friend/search
export const getFriendSearchSchema = Joi.object({
  query: otherSchemas.query,
});

// POST /friend/:friend_id/request
export const postFriendRequestBodySchema = Joi.object({
  friend_id: accountSchemas.user_id,
});

// POST /friend/:friend_id/request/reply
export const postFriendRequestReplyBodySchema = Joi.object({
  accepted: friendSchemas.accepted,
});
