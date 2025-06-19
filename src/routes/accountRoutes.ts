import { Router } from 'express';

import { getAccount, getAccountGoogle } from '../controllers/accountController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { googleErrorHandler } from '../middlewares/errorHandler';

const accountRouter = Router();

accountRouter.get('/', authMiddleware, getAccount);

accountRouter.get(
  '/google',
  authMiddleware,
  getAccountGoogle,
  googleErrorHandler,
);

export default accountRouter;
