import { Router } from 'express';

import {
  deleteFriend,
  getFriendAll,
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

friendRouter.get('/all', authMiddleware, getFriendAll);

friendRouter.delete(
  '/:friend_id',
  authMiddleware,
  validate(friendIdParamsSchema, 'params'),
  deleteFriend,
);

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
