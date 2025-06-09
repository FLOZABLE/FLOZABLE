import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { groupSelect } from '../queries/groupQueries';
import { getCachedUserGroups } from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import { PostJoinGroupBody, RawGroup } from '../types/groupTypes';

export const getGroups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawGroups: RawGroup[] = await prisma.groups.findMany({
      select: groupSelect,
    });

    const formattedGroups = formatGroups(rawGroups);

    res.send({ data: { groups: formattedGroups, my_groups: [] } });
  } catch (error) {
    next(error);
  }
};

export const getMyGroups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const myGroups = await getCachedUserGroups({ userId });
    res.send({ data: { groups: myGroups } });
  } catch (error) {
    next(error);
  }
};

export const postJoinGroup = async (
  req: Request<{}, {}, PostJoinGroupBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id, password } = req.body;

    console.log(group_id, password);

    const rawGroup: RawGroup | null = await prisma.groups.findFirst({
      select: groupSelect,
      where: {
        group_id,
      },
    });

    if (!rawGroup) {
      res.json({ success: false, message: 'Group not found' });
      return;
    }

    const [formattedGroup] = formatGroups([rawGroup]);

    console.log(formattedGroup);
    res.json({});
  } catch (error) {
    next(error);
  }
};
