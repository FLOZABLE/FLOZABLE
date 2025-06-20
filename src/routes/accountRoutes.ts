import { Router } from 'express';

import {
  getAccount,
  getAccountGoogle,
  getAccountProfile,
} from '../controllers/accountController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { googleErrorHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getAccountProfileParamsSchema,
  getAccountProfileQuerySchema,
} from '../schemas/accountSchemas';

const accountRouter = Router();

accountRouter.get('/', authMiddleware, getAccount);

accountRouter.get(
  '/google',
  authMiddleware,
  getAccountGoogle,
  googleErrorHandler,
);

accountRouter.get(
  '/:user_id/profile/',
  validate(getAccountProfileParamsSchema, 'params'),
  validate(getAccountProfileQuerySchema, 'query'),
  getAccountProfile,
);

export default accountRouter;
