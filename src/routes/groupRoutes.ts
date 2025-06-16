import { Router } from 'express';

import {
  getGroupMembers,
  getGroupAll,
  getMyGroups,
  postGroupJoin,
  putGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getGroupMembersParamsSchema,
  getGroupMembersQuerySchema,
  postGroupJoinBodySchema,
  postGroupJoinParamsSchema,
  putGroupSchema,
} from '../schemas/groupSchemas';

const groupRouter = Router();

groupRouter.get('/all', getGroupAll);

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
  validate(postGroupJoinParamsSchema, 'params'),
  postGroupJoin,
);

groupRouter.put(
  '/',
  authMiddleware,
  validate(putGroupSchema, 'body'),
  putGroup,
);

export default groupRouter;
