import { Router } from 'express';

import {
  deleteNotification,
  getNotificationsAll,
  postNotificationToken,
  putNotificationToken,
} from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  deleteNotificationSchema,
  postNotificationTokenSchema,
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

notificationRouter.post(
  '/token',
  authMiddleware,
  validate(postNotificationTokenSchema, 'body'),
  postNotificationToken,
);

notificationRouter.put(
  '/token',
  authMiddleware,
  validate(putNotificationTokenSchema, 'body'),
  putNotificationToken,
);

export default notificationRouter;
