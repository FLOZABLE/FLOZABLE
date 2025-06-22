import { Router } from 'express';

import { postFriendRequest } from '../controllers/friendController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { friendIdParamsSchema } from '../schemas/friendSchemas';

const notificationRouter = Router();

notificationRouter.post(
  '/notification/all',
  authMiddleware,
  postFriendRequest,
);

export default notificationRouter;
