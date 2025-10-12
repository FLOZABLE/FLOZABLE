import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { bcryptHash, bcryptVerify, nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  delCachedChatroomMembers,
  delCachedUserGroups,
  filterCachedUserGroups,
  getCachedUser,
  getCachedUserGroups,
  getCachedUsers,
  getCachedUsersStatus,
  getCachedUsersStudyTime,
  getCachedUserStatus,
  getCachedUserStudyTime,
  remCachedChatroomMember,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import { getMainIo } from '../sockets/mainIo';
import {
  GetGroupLeaderboardQuery,
  GetGroupLeaderboarParams,
  GetGroupMembersParams,
  GetGroupMembersQuery,
  GetGroupParams,
  GetGroupsQuery,
  PostGroupJoinBody,
  PostGroupJoinParams,
  PostGroupLeaveParams,
  PostGroupLikeBody,
  PostGroupLikeParams,
  PutGroupBody,
  RawGroup,
} from '../types/groupTypes';
import { Ranking } from '../types/rankingTypes';

export const getGroup = async (
  req: Request<GetGroupParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { group_id } = req.params;

    const rawGroup: RawGroup | null = await prisma.groups.findFirst({
      select: groupSelect,
      where: {
        group_id,
      },
    });

    if (!rawGroup) {
      const response = AppErrorFactory.groupNotFound();
      res.status(response.status).send(response);
      return;
    }

    const [formattedGroup] = formatGroups([rawGroup]);

    res.send({
      success: true,
      data: { group: formattedGroup },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deprecated
 * @param _req
 * @param res
 * @param next
 */
export const getGroupAll = async (
  _req: Request,
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

export const getGroups = async (
  req: Request<{}, {}, {}, GetGroupsQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req.query;
    const offset = parseInt(req.query.offset);

    console.log(query, 'query');

    const rawGroups: RawGroup[] = await prisma.groups.findMany({
      select: groupSelect,
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            tags: {
              contains: query,
            },
          },
        ],
      },
      take: 30,
      skip: offset,
    });

    const formattedGroups = formatGroups(rawGroups);

    res.send({
      success: true,
      data: { groups: formattedGroups },
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

    const myGroupIds = await getCachedUserGroups({ userId });

    const rawMyGroups: RawGroup[] = await prisma.groups.findMany({
      select: groupSelect,
      where: {
        group_id: {
          in: myGroupIds,
        },
      },
    });

    const formattedMyGroups = formatGroups(rawMyGroups);

    res.send({ data: { groups: formattedMyGroups } });
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

export const getGroupLeaderboard = async (
  req: Request<GetGroupLeaderboarParams, {}, {}, GetGroupLeaderboardQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { group_id } = req.params;

    const { date, timezone } = req.query;

    const dateTime = DateTime.fromISO(date).setZone(timezone);

    const groupMembers = await prisma.group_members.findMany({
      where: {
        group_id,
      },
      select: {
        user_id: true,
      },
    });

    const groupMemberIds = groupMembers.map((member) => member.user_id);

    if (!groupMemberIds.includes(userId)) {
      const response = AppErrorFactory.groupAccessDenied();
      res.status(response.statusCode).send(response);
      return;
    }

    const rawRankings = await prisma.ranking_details.findMany({
      where: {
        ranking: {
          date: dateTime.toSeconds(),
          mode: 'day',
        },
        user_id: {
          in: groupMemberIds,
        },
      },
      orderBy: {
        rank: 'asc',
      },
      select: {
        rank: true,
        user_id: true,
        study_time: true,
      },
    });

    const users = await getCachedUsers({
      userIds: groupMemberIds,
    });

    const rankings: Ranking[] = rawRankings
      .map((ranking) => {
        const user = users.find((user) => user.user_id === ranking.user_id);
        if (!user) return null;
        return { ...user, ...ranking, date: dateTime.toISODate() };
      })
      .filter((r): r is Ranking => !!r);

    res.send({ data: { rankings: rankings } });
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
    const { password, timezone } = req.body;

    // Fetch group with password and selected fields
    const rawGroup = await prisma.groups.findFirst({
      select: { ...groupSelect, password: true },
      where: { group_id },
    });

    if (!rawGroup) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    const [group] = formatGroups([rawGroup]);

    // If group is private, verify password
    if (!group.visibility) {
      const isValidPassword = await bcryptVerify(password, rawGroup.password);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: 'Wrong password' });
        return;
      }
    }

    const groupChatroom = await prisma.chatrooms.findFirst({
      where: { group_id },
      select: { chatroom_id: true },
    });

    const joined_at = nowSec();

    // Parallel cache deletion (if chatroom exists)
    await Promise.all([
      prisma.group_members.create({
        data: { group_id, user_id: userId, joined_at },
      }),
      delCachedUserGroups(userId),
      groupChatroom?.chatroom_id
        ? delCachedChatroomMembers(groupChatroom.chatroom_id)
        : null,
    ]);

    const mainIo = getMainIo();

    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60);

    const [studyTime, status, userInfo] = await Promise.all([
      getCachedUserStudyTime({
        userId: userId,
        viewer: 'day',
        timezoneOffset,
      }),
      getCachedUserStatus(userId),
      getCachedUser({ userId }),
    ]);

    const member = {
      ...userInfo,
      study_time: studyTime,
      status,
    };

    mainIo?.to(group_id).emit('group:new_member', { member });

    if (groupChatroom) {
      const sockets = await mainIo?.in(userId).fetchSockets();

      sockets?.forEach((socket) => {
        socket.join(`chatroom:${groupChatroom.chatroom_id}`);
      });
    }

    group.members.push(userId);

    res.json({
      success: true,
      status: 200,
      message: `Joined group ${group.name}`,
      data: { group },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
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

    const groupChatroom = await prisma.chatrooms.findFirst({
      where: { group_id },
      select: { chatroom_id: true },
    });

    if (groupChatroom) {
      remCachedChatroomMember(userId, groupChatroom.chatroom_id);
    }

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

    await prisma.group_members.create({
      data: {
        group_id,
        joined_at: created_at,
        user_id: userId,
      },
    });

    //create chatroom for group
    const chatroom_id = nanoid(10);

    await prisma.chatrooms.create({
      data: {
        chatroom_id,
        name,
        type: 'group',
        group_id,
      },
    });

    const mainIo = getMainIo();

    const sockets = await mainIo?.in(userId).fetchSockets();

    sockets?.forEach((socket) => {
      socket.join(`chatroom:${chatroom_id}`);
    });

    const [newGroup] = formatGroups([
      { ...newRawGroup, group_likes: [], group_members: [{ user_id: userId }] },
    ]);

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
