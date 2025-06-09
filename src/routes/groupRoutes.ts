import { Router } from 'express';

import {
  getGroups,
  getMyGroups,
  postJoinGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { postJoinGroupSchema } from '../schemas/groupSchemas';

const groupRouter = Router();

groupRouter.get('/all', getGroups);

groupRouter.get('/mine', authMiddleware, getMyGroups);

groupRouter.post(
  '/join',
  authMiddleware,
  validate(postJoinGroupSchema, 'body'),
  postJoinGroup,
);

export default groupRouter;
