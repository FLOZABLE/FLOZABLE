import { Router } from 'express';

import {
  deleteNotification,
  getNotificationsAll,
} from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { deleteNotificationSchema } from '../schemas/notificationSchemas';

const notificationRouter = Router();

notificationRouter.get('/all', authMiddleware, getNotificationsAll);

notificationRouter.delete(
  '/:notification_id',
  authMiddleware,
  validate(deleteNotificationSchema, 'params'),
  deleteNotification,
);

export default notificationRouter;
