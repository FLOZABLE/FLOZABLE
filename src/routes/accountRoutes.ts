import { Router } from 'express';

import {
  getAccount,
  getAccountGoogle,
  patchAccountInfo,
  patchAccountPassword,
  putAccountProfileImage,
} from '../controllers/accountController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { googleErrorHandler } from '../middlewares/errorHandler';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  patchAccountInfoBodySchema,
  patchAccountPasswordBodySchema,
} from '../schemas/accountSchemas';

const accountRouter = Router();

accountRouter.get('/', authMiddleware, getAccount);

accountRouter.patch(
  '/info',
  authMiddleware,
  validate(patchAccountInfoBodySchema, 'body'),
  patchAccountInfo,
);

accountRouter.put(
  '/profile/image',
  authMiddleware,
  uploadMiddleware.single('file'),
  putAccountProfileImage,
);

accountRouter.patch(
  '/password',
  authMiddleware,
  validate(patchAccountPasswordBodySchema, 'body'),
  patchAccountPassword,
);

accountRouter.get(
  '/google',
  authMiddleware,
  getAccountGoogle,
  googleErrorHandler,
);

export default accountRouter;
