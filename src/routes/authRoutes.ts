import { Router } from 'express';

import {
  getAuthGoogleCallback,
  postAuthLogin,
  postAuthLogout,
  postAuthSignup,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getAuthGoogleCallbackSchema,
  postAuthLoginSchema,
  postAuthSignupSchema,
} from '../schemas/authSchemas';

const authRouter = Router();

authRouter.post(
  '/signup',
  validate(postAuthSignupSchema, 'body'),
  postAuthSignup,
);

authRouter.post('/login', validate(postAuthLoginSchema, 'body'), postAuthLogin);

authRouter.post('/logout', authMiddleware, postAuthLogout);

authRouter.get(
  '/google/callback',
  validate(getAuthGoogleCallbackSchema, 'query'),
  getAuthGoogleCallback,
);

export default authRouter;
