import { Router } from 'express';

import {
  getThemeAll,
  getThemeMine,
  postThemeSave,
  postThemeUnsave,
  putTheme,
} from '../controllers/themeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  postThemeSaveSchema,
  postThemeUnsaveSchema,
  putThemeSchema,
} from '../schemas/themeSchemas';

const themeRouter = Router();

themeRouter.get('/all', getThemeAll);

themeRouter.get('/mine', authMiddleware, getThemeMine);

themeRouter.put(
  '/',
  authMiddleware,
  validate(putThemeSchema, 'body'),
  putTheme,
);

themeRouter.post(
  '/save',
  authMiddleware,
  validate(postThemeSaveSchema, 'body'),
  postThemeSave,
);

themeRouter.post(
  '/unsave',
  authMiddleware,
  validate(postThemeUnsaveSchema, 'body'),
  postThemeUnsave,
);

export default themeRouter;
