import { Prisma } from '../generated/prisma';
import { groupSelect } from '../queries/groupQueries';
import { Viewer } from './otherTypes';

//GET /group/:group_id
export type GetGroupParams = {
  group_id: string;
};

//POST /group/:group_id/join
export type PostGroupJoinParams = {
  group_id: string;
};

//POST /group/:group_id/join
export type PostGroupJoinBody = {
  password: string | null;
  timezone: string;
};

//POST /group/:group_id/leave
export type PostGroupLeaveParams = {
  group_id: string;
};

//POST /group/:group_id/like
export type PostGroupLikeParams = {
  group_id: string;
};

//POST /group/:group_id/like
export type PostGroupLikeBody = {
  like: boolean;
};

//GET /group/search
export type GetGroupsQuery = {
  query: string;
  offset: string;
};

//GET /group/:group_id/members
export type GetGroupMembersParams = {
  group_id: string;
};

//GET /group/:group_id/leaderboard
export type GetGroupLeaderboarParams = {
  group_id: string;
};

//GET /group/:group_id/leaderboard
export type GetGroupLeaderboardQuery = {
  date: string;
  timezone: string;
  viewer: Viewer;
};

//GET /group/:group_id/members
export type GetGroupMembersQuery = {
  timezone: string;
};

//PUT /group
export type PutGroupBody = {
  name: string;
  password?: string | null;
  description: string;
  max_members: number;
  tags: string[];
  color: string;
  goal_hr: number;
  visibility: boolean;
};

export type RawGroup = Prisma.groupsGetPayload<{ select: typeof groupSelect }>;

export type Group = Omit<
  RawGroup,
  'group_members' | 'group_likes' | 'visibility'
> & {
  members: string[];
  likes: string[];
  visibility: boolean;
};
