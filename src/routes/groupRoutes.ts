import { Router } from 'express';

import {
  getGroupAll,
  getGroupMembers,
  getMyGroups,
  postGroupJoin,
  postGroupLeave,
  postGroupLike,
  putGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getGroupMembersParamsSchema,
  getGroupMembersQuerySchema,
  postGroupJoinParamsSchema,
  postGroupLikeParamsSchema,
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

groupRouter.post('/:group_id/leave', authMiddleware, postGroupLeave);

groupRouter.post(
  '/:group_id/like',
  authMiddleware,
  validate(postGroupLikeParamsSchema, 'params'),
  postGroupLike,
);

groupRouter.put(
  '/',
  authMiddleware,
  validate(putGroupSchema, 'body'),
  putGroup,
);

export default groupRouter;
