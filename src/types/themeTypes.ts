//PUT /theme
export interface PutThemeBody {
  name: string;
  description: string;
  tags: string[];
  video_id: string;
}
