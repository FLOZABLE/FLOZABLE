import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { PutExtensionSetting } from '../types/extensionTypes';

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

export const putExtensionSetting = async (
  req: Request<{}, {}, PutExtensionSetting>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { website, block, study_block, timer, study_timer } = req.body;

    const websiteSetting = await prisma.website_settings.create({
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
      message: `Setting for ${websiteSetting.website}`,
    });
  } catch (error) {
    next(error);
  }
};
