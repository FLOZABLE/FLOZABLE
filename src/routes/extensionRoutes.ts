import { Router } from 'express';

import {
  getExtensionToken,
  putExtensionSetting,
} from '../controllers/extensionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { putExtensionSettingSchema } from '../schemas/extensionSchemas';

const extensionRouter = Router();

extensionRouter.get('/token', authMiddleware, getExtensionToken);
extensionRouter.put(
  '/setting',
  authMiddleware,
  validate(putExtensionSettingSchema, 'body'),
  putExtensionSetting,
);

export default extensionRouter;
