import { Router } from 'express';

import { getUserProfile } from '../controllers/userController';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getUserProfileQuerySchema,
  getUserStatusQuerySchema,
  userIdParamsSchema,
} from '../schemas/userSchemas';

const userRouter = Router();

userRouter.get(
  '/:user_id/profile/',
  validate(userIdParamsSchema, 'params'),
  validate(getUserProfileQuerySchema, 'query'),
  getUserProfile,
);

userRouter.get(
  '/:user_id/profile/',
  validate(userIdParamsSchema, 'params'),
  validate(getUserStatusQuerySchema, 'query'),
  getUserProfile,
);

export default userRouter;
