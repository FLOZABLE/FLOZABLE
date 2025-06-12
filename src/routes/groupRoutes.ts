import { Router } from 'express';

import {
  getGroupMembers,
  getGroups,
  getMyGroups,
  postJoinGroup,
  putGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getGroupMembersParamsSchema,
  getGroupMembersQuerySchema,
  postJoinGroupBodySchema,
  postJoinGroupParamsSchema,
  putGroupSchema,
} from '../schemas/groupSchemas';

const groupRouter = Router();

groupRouter.get('/all', getGroups);

groupRouter.get('/mine', authMiddleware, getMyGroups);

groupRouter.get(
  '/:group_id/members',
  authMiddleware,
  validate(getGroupMembersParamsSchema, 'params'),
  validate(getGroupMembersQuerySchema, 'query'),
  getGroupMembers,
);

groupRouter.post(
  '/:group_id/join',
  authMiddleware,
  validate(postJoinGroupParamsSchema, 'params'),
  postJoinGroup,
);

groupRouter.put(
  '/',
  authMiddleware,
  validate(putGroupSchema, 'body'),
  putGroup,
);

export default groupRouter;
