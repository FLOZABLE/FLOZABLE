import { Router } from 'express';

import { getAccount, getAccountGoogle } from '../controllers/accountController';
import { authMiddleware } from '../middlewares/authMiddleware';

const accountRouter = Router();

accountRouter.get('/', authMiddleware, getAccount);

accountRouter.get('/google', authMiddleware, getAccountGoogle);

export default accountRouter;
