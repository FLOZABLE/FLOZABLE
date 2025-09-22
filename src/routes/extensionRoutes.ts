import { Router } from 'express';

import {
  getExtensionSettings,
  getExtensionToken,
  patchExtensionSetting,
  putExtensionSetting,
} from '../controllers/extensionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  patchExtensionSettingSchema,
  putExtensionSettingSchema,
} from '../schemas/extensionSchemas';

const extensionRouter = Router();

extensionRouter.get('/token', authMiddleware, getExtensionToken);

extensionRouter.get('/setting/all', authMiddleware, getExtensionSettings);

extensionRouter.put(
  '/setting',
  authMiddleware,
  validate(putExtensionSettingSchema, 'body'),
  putExtensionSetting,
);

extensionRouter.patch(
  '/setting',
  authMiddleware,
  validate(patchExtensionSettingSchema, 'body'),
  patchExtensionSetting,
);

export default extensionRouter;
