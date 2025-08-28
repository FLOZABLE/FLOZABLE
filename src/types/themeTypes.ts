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
