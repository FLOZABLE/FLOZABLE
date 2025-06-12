import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { bcryptHash, nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  delCachedUserGroups,
  getCachedUserGroups,
  getCachedUserStatus,
  getCachedUserStudyTime,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import {
  GetGroupMembersParams,
  GetGroupMembersQuery,
  PostJoinGroupBody,
  PostJoinGroupParams,
  PutGroupBody,
  RawGroup,
} from '../types/groupTypes';

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

    res.send({
      success: true,
      data: { groups: formattedGroups, my_groups: [] },
    });
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

export const getGroupMembers = async (
  req: Request<GetGroupMembersParams, {}, {}, GetGroupMembersQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;

    const { timezone } = req.query;

    const userGroups = await getCachedUserGroups({ userId });

    if (!userGroups.find((groupId) => groupId === group_id)) {
      res.send({
        success: false,
        message: 'Not a member of this group',
        status: 403,
        error: {
          reason: 'Not a member of this group',
        },
      });
      return;
    }

    const rawGroupMembers = await prisma.group_members.findMany({
      select: {
        users: {
          select: {
            name: true,
            user_id: true,
          },
        },
      },
      where: {
        group_id,
      },
    });

    const groupMembers = rawGroupMembers.map((member) => member.users);

    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60);

    const members = await Promise.all(
      groupMembers.map(async (member) => {
        const studyTime = await getCachedUserStudyTime({
          userId: member.user_id,
          timezoneOffset,
          viewer: 'day',
        });
        const activeSubject = await getCachedUserStatus(member.user_id);
        return {
          ...member,
          study_time: studyTime,
          active_subject: activeSubject,
        };
      }),
    );

    res.send({ data: { members } });
  } catch (error) {
    next(error);
  }
};

export const postJoinGroup = async (
  req: Request<PostJoinGroupParams, {}, PostJoinGroupBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;
    const { password } = req.body;

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

    const [group] = formatGroups([rawGroup]);

    if (!group.visibility) {
    }

    group.members.push(userId);

    const joined_at = nowSec();

    await prisma.group_members.create({
      data: {
        group_id,
        joined_at,
        user_id: userId,
      },
    });

    res.json({
      success: true,
      message: `Joined group ${group.name}`,
      data: { group },
    });
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
