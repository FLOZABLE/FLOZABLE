import { Router } from 'express';

import {
  getGroups,
  getMyGroups,
  postJoinGroup,
  putGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { postJoinGroupSchema, putGroupSchema } from '../schemas/groupSchemas';

const groupRouter = Router();

groupRouter.get('/all', getGroups);

groupRouter.get('/mine', authMiddleware, getMyGroups);

groupRouter.post(
  '/join',
  authMiddleware,
  validate(postJoinGroupSchema, 'body'),
  postJoinGroup,
);

groupRouter.put(
  '/',
  authMiddleware,
  validate(putGroupSchema, 'body'),
  putGroup,
);

export default groupRouter;
