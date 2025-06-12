import { Prisma } from '../generated/prisma';
import { groupSelect } from '../queries/groupQueries';

export type PostJoinGroupParams = {
  group_id: string;
};

export type PostJoinGroupBody = {
  password: string | null;
};

export type GetGroupMembersParams = {
  group_id: string;
};

export type GetGroupMembersQuery = {
  timezone: string;
};

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
