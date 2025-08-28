import { Prisma } from '../generated/prisma';
import { themeSelect } from '../queries/themeQueries';

//PUT /theme
export interface PutThemeBody {
  name: string;
  description: string;
  tags: string[];
  video_id: string;
}

//POST /theme/save
export interface PostThemeSaveBody {
  theme_id: string;
}

//POST /theme/unsave
export interface PostThemeUnsaveBody {
  theme_id: string;
}

//POST /theme/like
export interface PostThemeLikeBody {
  theme_id: string;
  like: boolean;
}

export type RawTheme = Prisma.themesGetPayload<{ select: typeof themeSelect }>;

export interface Theme {
  theme_id: string;
  likes: string[];
  name: string;
  description: string;
  video_id: string;
  tags: string[];
}
