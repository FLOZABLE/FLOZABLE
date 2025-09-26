import { NextFunction, Request, Response } from 'express';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { websiteSettingSelect } from '../queries/extensionQueries';
import { getMainIo } from '../sockets/mainIo';
import {
  DeleteExtensionSetting,
  PatchExtensionSetting,
  PutExtensionSetting,
} from '../types/extensionTypes';

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
      select: websiteSettingSelect,
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
      select: websiteSettingSelect,
    });

    const mainIo = getMainIo();
    mainIo
      ?.to(userId)
      .emit('website_setting_created', { data: { setting: websiteSetting } });

    res.send({
      success: true,
      message: `Setting for ${websiteSetting.website} created`,
      data: {
        setting: websiteSetting,
      },
      select: websiteSettingSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        message: 'You have already added this website.',
      });
      return;
    }

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
      select: websiteSettingSelect,
    });

    const mainIo = getMainIo();
    mainIo
      ?.to(userId)
      .emit('website_setting_updated', { data: { setting: websiteSetting } });

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

export const deleteExtensionSetting = async (
  req: Request<{}, {}, DeleteExtensionSetting>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { website } = req.body;

    const websiteSetting = await prisma.website_settings.delete({
      where: {
        user_id_website: {
          user_id: userId,
          website,
        },
      },
    });

    const mainIo = getMainIo();
    mainIo?.to(userId).emit('website_setting_deleted', { data: { website } });

    res.send({
      success: true,
      message: `Setting for ${websiteSetting.website} deleted`,
    });
  } catch (error) {
    next(error);
  }
};
