import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import {
  PostThemeSaveBody,
  PostThemeUnsaveBody,
  PutThemeBody,
} from '../types/themeTypes';

export const getThemeAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawThemes = await prisma.themes.findMany({
      select: {
        theme_id: true,
        theme_likes: true,
        name: true,
        description: true,
        video_id: true,
        tags: true,
      },
    });

    const themes = rawThemes.map((rawTheme) => ({
      ...rawTheme,
      tags: rawTheme.tags.split(','),
    }));
    res.send({ success: true, data: { themes } });
  } catch (error) {
    next(error);
  }
};

export const getThemeMine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id;

    const rawThemes = await prisma.themes.findMany({
      select: {
        theme_id: true,
        theme_likes: true,
        name: true,
        description: true,
        video_id: true,
        tags: true,
      },
      where: {
        user_id: userId,
      },
    });

    const themes = rawThemes.map((rawTheme) => ({
      ...rawTheme,
      tags: rawTheme.tags.split(','),
    }));
    res.send({ success: true, data: { themes } });
  } catch (error) {
    next(error);
  }
};

export const putTheme = async (
  req: Request<{}, {}, PutThemeBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, tags, video_id } = req.body;
    const theme_id = nanoid(10);
    const userId = req.user_id!;

    const rawTheme = await prisma.themes.create({
      data: {
        name,
        description,
        tags: tags.join(','),
        video_id,
        theme_id,
        user_id: userId,
      },
    });

    const theme = {
      ...rawTheme,
      tags,
    };

    res.send({ success: true, message: 'New theme created', data: { theme } });
  } catch (error) {
    next(error);
  }
};

export const postThemeSave = async (
  req: Request<{}, {}, PostThemeSaveBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { theme_id } = req.body;

    await prisma.user_themes.create({
      data: {
        user_id: userId,
        theme_id,
      },
    });

    res.send({ success: true, message: 'Theme saved' });
  } catch (error) {
    next(error);
  }
};

export const postThemeUnsave = async (
  req: Request<{}, {}, PostThemeUnsaveBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { theme_id } = req.body;

    await prisma.user_themes.deleteMany({
      where: {
        user_id: userId,
        theme_id,
      },
    });

    res.send({ success: true, message: 'Theme unsaved' });
  } catch (error) {
    next(error);
  }
};
