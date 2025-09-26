import { Router } from 'express';

import {
  deleteExtensionSetting,
  getExtensionSettings,
  patchExtensionSetting,
  putExtensionSetting,
} from '../controllers/extensionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  deleteExtensionSettingSchema,
  patchExtensionSettingSchema,
  putExtensionSettingSchema,
} from '../schemas/extensionSchemas';

const extensionRouter = Router();

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

extensionRouter.delete(
  '/setting',
  authMiddleware,
  validate(deleteExtensionSettingSchema, 'body'),
  deleteExtensionSetting,
);

export default extensionRouter;
