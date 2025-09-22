import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import {
  PatchExtensionSetting,
  PutExtensionSetting,
} from '../types/extensionTypes';

export const getExtensionToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    res.send({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};

export const getExtensionSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const settings = await prisma.website_settings.findMany({
      where: {
        user_id: userId,
      },
      select: {
        website: true,
        block: true,
        study_block: true,
        timer: true,
        study_timer: true,
      },
    });

    res.send({
      success: true,
      data: {
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const putExtensionSetting = async (
  req: Request<{}, {}, PutExtensionSetting>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { website } = req.body;

    const websiteSetting = await prisma.website_settings.create({
      data: {
        website,
        block: false,
        study_block: true,
        timer: false,
        study_timer: true,
        user_id: userId,
      },
    });

    res.send({
      success: true,
      message: `Setting for ${websiteSetting.website} created`,
      data: {
        setting: websiteSetting,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const patchExtensionSetting = async (
  req: Request<{}, {}, PatchExtensionSetting>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { website, block, study_block, timer, study_timer } = req.body;

    const websiteSetting = await prisma.website_settings.update({
      where: {
        user_id_website: {
          user_id: userId,
          website,
        },
      },
      data: {
        website,
        block,
        study_block,
        timer,
        study_timer,
        user_id: userId,
      },
    });

    res.send({
      success: true,
      message: `Setting for ${websiteSetting.website} updated`,
      data: {
        setting: websiteSetting,
      },
    });
  } catch (error) {
    next(error);
  }
};
