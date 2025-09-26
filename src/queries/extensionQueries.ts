import { Prisma } from '../generated/prisma';

export const websiteSettingSelect =
  Prisma.validator<Prisma.website_settingsSelect>()({
    website: true,
    block: true,
    study_block: true,
    timer: true,
    study_timer: true,
  });
