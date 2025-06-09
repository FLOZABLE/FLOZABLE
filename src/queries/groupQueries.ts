import { Prisma } from '../generated/prisma';

export const groupSelect = Prisma.validator<Prisma.groupsSelect>()({
  group_id: true,
  name: true,
  leader: true,
  visibility: true,
  description: true,
  created_at: true,
  max_members: true,
  tags: true,
  color: true,
  goal_hr: true,
  group_members: {
    select: {
      user_id: true,
    },
  },
  group_likes: {
    select: {
      user_id: true,
    },
  },
});
