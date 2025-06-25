import { Router } from 'express';

import {
  postFriendRequest,
  postFriendRequestReply,
} from '../controllers/friendController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  friendIdParamsSchema,
  friendshipIdParamsSchema,
  postFriendRequestReplyBodySchema,
} from '../schemas/friendSchemas';

const friendRouter = Router();

friendRouter.post(
  '/:friend_id/request',
  authMiddleware,
  validate(friendIdParamsSchema, 'params'),
  postFriendRequest,
);

friendRouter.post(
  '/request/:friendship_id/reply',
  authMiddleware,
  validate(friendshipIdParamsSchema, 'params'),
  validate(postFriendRequestReplyBodySchema, 'body'),
  postFriendRequestReply,
);

export default friendRouter;
