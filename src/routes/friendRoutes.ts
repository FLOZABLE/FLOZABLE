import { Router } from 'express';

import { postFriendRequest } from '../controllers/friendController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { friendIdParamsSchema } from '../schemas/friendSchemas';

const friendRouter = Router();

friendRouter.post(
  '/:friend_id/request',
  authMiddleware,
  validate(friendIdParamsSchema, 'params'),
  postFriendRequest,
);

export default friendRouter;
