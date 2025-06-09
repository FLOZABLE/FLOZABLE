import { Prisma } from '../generated/prisma';
import { groupSelect } from '../queries/groupQueries';

export type PostJoinGroupBody = {
  group_id: string;
  password: string | undefined;
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
