import { Router } from 'express';

import { getNotificationsAll } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const notificationRouter = Router();

notificationRouter.get('/all', authMiddleware, getNotificationsAll);

export default notificationRouter;
