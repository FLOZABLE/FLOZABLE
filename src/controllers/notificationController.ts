import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { friendRequest } from '../services/friendService';

export const getNotificationsAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const friendRequests = await prisma.friends.findMany({
      where: {
        OR: [
          { user_id: userId, status: 'pending' },
          { friend_id: userId, status: 'pending' },
        ],
      },
      select: {
        date: true,
        user_id: true,
        friend_id: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
