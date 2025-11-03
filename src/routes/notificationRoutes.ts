import { Router } from 'express';

import {
  deleteNotification,
  getNotificationsAll,
  putNotificationToken,
} from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  deleteNotificationSchema,
  putNotificationTokenSchema,
} from '../schemas/notificationSchemas';

const notificationRouter = Router();

notificationRouter.get('/all', authMiddleware, getNotificationsAll);

notificationRouter.delete(
  '/:notification_id',
  authMiddleware,
  validate(deleteNotificationSchema, 'params'),
  deleteNotification,
);

notificationRouter.put(
  '/token',
  authMiddleware,
  validate(putNotificationTokenSchema, 'body'),
  putNotificationToken,
);

export default notificationRouter;
