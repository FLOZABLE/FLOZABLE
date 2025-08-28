import { RawTheme, Theme } from '../types/themeTypes';

export const formatThemes = (rawThemes: RawTheme[]): Theme[] => {
  try {
    return rawThemes.map((rawTheme) => ({
      theme_id: rawTheme.theme_id,
      name: rawTheme.name,
      description: rawTheme.description,
      video_id: rawTheme.video_id,
      tags: rawTheme.tags.split(','),
      likes: rawTheme.theme_likes.map((l) => l.user_id),
    }));
  } catch (err) {
    console.error('Failed to format groups:', err);
    return [];
  }
};
