// PUT /extension/setting
export interface PutExtensionSetting {
  website: string;
  /* block: boolean;
  study_block: boolean;
  timer: boolean;
  study_timer: boolean; */
}

// PATCH /extension/setting
export interface PatchExtensionSetting {
  website: string;
  block: boolean;
  study_block: boolean;
  timer: boolean;
  study_timer: boolean;
}
