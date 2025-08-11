import { Router } from 'express';

import {
  getAuthGoogleCallback,
  postAuthLogin,
  postAuthLoginApp,
  postAuthLogout,
  postAuthSignup,
  postAuthSignupApp,
  postAuthTokenVerify,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getAuthGoogleCallbackSchema,
  postAuthLoginAppSchema,
  postAuthLoginSchema,
  postAuthSignupAppSchema,
  postAuthSignupSchema,
  postAuthTokenVerifySchema,
} from '../schemas/authSchemas';

const authRouter = Router();

authRouter.post(
  '/signup',
  validate(postAuthSignupSchema, 'body'),
  postAuthSignup,
);

authRouter.post(
  '/signup/app',
  validate(postAuthSignupAppSchema, 'body'),
  postAuthSignupApp,
);

authRouter.post('/login', validate(postAuthLoginSchema, 'body'), postAuthLogin);

authRouter.post(
  '/login/app',
  validate(postAuthLoginAppSchema, 'body'),
  postAuthLoginApp,
);

authRouter.post(
  '/token/verify',
  authMiddleware,
  validate(postAuthTokenVerifySchema, 'body'),
  postAuthTokenVerify,
);

authRouter.post('/logout', authMiddleware, postAuthLogout);

authRouter.get(
  '/google/callback',
  validate(getAuthGoogleCallbackSchema, 'query'),
  getAuthGoogleCallback,
);

export default authRouter;
