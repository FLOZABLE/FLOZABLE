import { Prisma } from '../generated/prisma';

export const themeSelect = Prisma.validator<Prisma.themesSelect>()({
  theme_id: true,
  name: true,
  description: true,
  video_id: true,
  tags: true,
  theme_likes: {
    select: {
      user_id: true,
    },
  },
});
