import { Router } from 'express';

import { getAccount } from '../controllers/accountController';
import { authMiddleware } from '../middlewares/authMiddleware';

const accountRouter = Router();

accountRouter.get('/', authMiddleware, getAccount);

export default accountRouter;
