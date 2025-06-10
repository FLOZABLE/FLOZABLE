import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { bcryptHash, nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  delCachedUserGroups,
  getCachedUserGroups,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import { PostJoinGroupBody, PutGroupBody, RawGroup } from '../types/groupTypes';

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

    if (!formattedGroup.visibility) {
    }

    const joined_at = nowSec();

    await prisma.group_members.create({
      data: {
        group_id,
        joined_at,
        user_id: userId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Unique constraint violation — user already joined
      res.status(409).json({
        success: false,
        message: 'You have already joined this group.',
      });
      return;
    }

    next(error);
  }
};

export const putGroup = async (
  req: Request<{}, {}, PutGroupBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { name, password, description, max_members, color, goal_hr } =
      req.body;

    const tags = JSON.stringify(req.body.tags);
    const visibility = req.body.visibility ? 1 : 0;

    const group_id = nanoid(10);
    const created_at = nowSec();

    const hashed_password = password ? await bcryptHash(password) : null;

    const newRawGroup = await prisma.groups.create({
      data: {
        group_id,
        name,
        description,
        max_members,
        tags,
        color,
        goal_hr,
        visibility,
        created_at,
        leader: userId,
        password: hashed_password,
      },
    });

    const newMember = await prisma.group_members.create({
      data: {
        group_id,
        joined_at: created_at,
        user_id: userId,
      },
    });

    const [newGroup] = formatGroups([
      { ...newRawGroup, group_likes: [], group_members: [{ user_id: userId }] },
    ]);
    console.log(newGroup, newMember);

    delCachedUserGroups(userId);

    res.json({
      success: true,
      message: `Group ${newGroup.name} created`,
      data: {
        group: newGroup,
      },
    });
  } catch (error) {
    next(error);
  }
};
