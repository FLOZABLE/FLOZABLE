import { Router } from 'express';

import {
  getGroup,
  getGroupLeaderboard,
  getGroupMembers,
  getGroups,
  getMyGroups,
  getRecommendedGroups,
  postGroupJoin,
  postGroupLeave,
  postGroupLike,
  putGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getGroupLeaderboardQuerySchema,
  getGroupMembersQuerySchema,
  getGroupsSchema,
  groupIdParamsSchema,
  putGroupSchema,
} from '../schemas/groupSchemas';

const groupRouter = Router();

//groupRouter.get('/all', getGroupAll);

groupRouter.get('/search', validate(getGroupsSchema, 'query'), getGroups);

groupRouter.get('/mine', authMiddleware, getMyGroups);

groupRouter.get('/recommended', authMiddleware, getRecommendedGroups);

groupRouter.get(
  '/:group_id',
  validate(groupIdParamsSchema, 'params'),
  getGroup,
);

groupRouter.get(
  '/:group_id/members',
  authMiddleware,
  validate(groupIdParamsSchema, 'params'),
  validate(getGroupMembersQuerySchema, 'query'),
  getGroupMembers,
);

groupRouter.get(
  '/:group_id/leaderboard',
  authMiddleware,
  validate(groupIdParamsSchema, 'params'),
  validate(getGroupLeaderboardQuerySchema, 'query'),
  getGroupLeaderboard,
);

groupRouter.post(
  '/:group_id/join',
  authMiddleware,
  validate(groupIdParamsSchema, 'params'),
  postGroupJoin,
);

groupRouter.post(
  '/:group_id/leave',
  authMiddleware,
  validate(groupIdParamsSchema, 'params'),
  postGroupLeave,
);

groupRouter.post(
  '/:group_id/like',
  authMiddleware,
  validate(groupIdParamsSchema, 'params'),
  postGroupLike,
);

groupRouter.put(
  '/',
  authMiddleware,
  validate(putGroupSchema, 'body'),
  putGroup,
);

export default groupRouter;
