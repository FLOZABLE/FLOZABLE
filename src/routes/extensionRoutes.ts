import { Router } from 'express';

import { getExtensionToken } from '../controllers/extensionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const extensionRouter = Router();

extensionRouter.get('/token', authMiddleware, getExtensionToken);

export default extensionRouter;
