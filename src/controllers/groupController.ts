import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { bcryptHash, bcryptVerify, nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  delCachedUserGroups,
  filterCachedUserGroups,
  getCachedUserGroups,
  getCachedUsersStatus,
  getCachedUsersStudyTime,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import {
  GetGroupMembersParams,
  GetGroupMembersQuery,
  PostGroupJoinBody,
  PostGroupJoinParams,
  PostGroupLeaveParams,
  PostGroupLikeBody,
  PostGroupLikeParams,
  PutGroupBody,
  RawGroup,
} from '../types/groupTypes';

export const getGroupAll = async (
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

    const date1 = Date.now();

    const userGroups = await getCachedUserGroups({ userId });
    const userGroupSet = new Set(userGroups);

    if (!userGroupSet.has(group_id)) {
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
        user: {
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

    const groupMembers = rawGroupMembers.map((member) => member.user);

    const memberIds = groupMembers.map((member) => member.user_id);
    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60);

    // 4. Fetch all enrichment data in parallel with bulk operations
    const [studyTimes, statuses] = await Promise.all([
      getCachedUsersStudyTime({
        userIds: memberIds,
        viewer: 'day',
        timezoneOffset,
      }),
      getCachedUsersStatus(memberIds),
    ]);

    // 5. Create Maps for efficient O(1) data merging
    const studyTimeMap = new Map(
      studyTimes.map((item) => [item.userId, item.studyTime]),
    );
    const statusMap = new Map(
      statuses.map((item) => [item.userId, item.status]),
    );

    // 6. Combine all data in a single, efficient loop
    const members = groupMembers.map((member) => ({
      ...member,
      study_time: studyTimeMap.get(member.user_id) || 0,
      status: statusMap.get(member.user_id) || null,
    }));

    const date2 = Date.now();

    console.log('result', group_id, memberIds.length, date2 - date1);

    res.send({ data: { members } });
  } catch (error) {
    next(error);
  }
};

export const postGroupJoin = async (
  req: Request<PostGroupJoinParams, {}, PostGroupJoinBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;
    const { password } = req.body;

    const rawGroup = await prisma.groups.findFirst({
      select: { ...groupSelect, password: true },
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
      const valid = await bcryptVerify(password, rawGroup.password);
      if (!valid) {
        res.send({ success: false, message: 'Wrong password' });
        return;
      }
    }

    group.members.push(userId);

    const joined_at = nowSec();

    await delCachedUserGroups(userId);

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

export const postGroupLeave = async (
  req: Request<PostGroupLeaveParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;

    const group = await prisma.group_members.delete({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: group_id,
        },
      },
    });

    filterCachedUserGroups(userId, group_id);

    res.json({
      success: true,
      message: `Left group`,
      data: { group },
    });
  } catch (error) {
    next(error);
  }
};

export const postGroupLike = async (
  req: Request<PostGroupLikeParams, {}, PostGroupLikeBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;

    const { like } = req.body;

    if (like) {
      await prisma.group_likes.create({
        data: {
          user_id: userId,
          group_id,
        },
      });
    } else {
      await prisma.group_likes.delete({
        where: {
          user_id_group_id: {
            user_id: userId,
            group_id: group_id,
          },
        },
      });
    }

    filterCachedUserGroups(userId, group_id);

    res.json({
      success: true,
      //message: like ? `Liked group` : '',
    });
  } catch (error) {
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
      message: `Group {newGroup.name} created`,
      data: {
        group: 'newGroup',
      },
    });
  } catch (error) {
    next(error);
  }
};
