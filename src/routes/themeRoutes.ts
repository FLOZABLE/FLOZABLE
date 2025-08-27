import { Router } from 'express';

import { getThemeAll, putTheme } from '../controllers/themeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { putThemeSchema } from '../schemas/themeSchemas';

const themeRouter = Router();

themeRouter.get('/all', getThemeAll);

themeRouter.put(
  '/',
  authMiddleware,
  validate(putThemeSchema, 'body'),
  putTheme,
);

export default themeRouter;
