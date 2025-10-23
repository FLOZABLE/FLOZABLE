import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  filterCachedUserFriends,
  getCachedUserFriends,
  getCachedUsers,
  getCachedUsersActiveGroup,
  getCachedUsersStatus,
  getCachedUsersStudyTime,
} from '../services/cacheService';
import { friendRequest, replyFriendRequest } from '../services/friendService';
import { formatGroups } from '../services/groupService';
import {
  FriendIdParams,
  FriendshipIdParams,
  GetFriendAllStatusQuery,
  GetFriendSearchQuery,
  PostFriendRequestReplyBody,
} from '../types/friendTypes';

export const getFriendAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const friends = await getCachedUserFriends({ userId });

    res.send({ success: true, data: { friends } });
  } catch (error) {
    next(error);
  }
};

export const getFriendAllStatus = async (
  req: Request<{}, {}, {}, GetFriendAllStatusQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const timezone = req.query.timezone;

    const friendIds = await getCachedUserFriends({ userId });

    const friends = await getCachedUsers({ userIds: friendIds });

    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60);

    // 4. Fetch all enrichment data in parallel with bulk operations
    const [studyTimes, statuses, activeGroups] = await Promise.all([
      getCachedUsersStudyTime({
        userIds: friendIds,
        viewer: 'day',
        timezoneOffset,
      }),
      getCachedUsersStatus(friendIds),
      getCachedUsersActiveGroup(friendIds),
    ]);

    const activeGroupIds = Array.from(
      new Set(
        activeGroups
          .map((item) => item.activeGroup?.group_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const rawGroups = await prisma.groups.findMany({
      where: {
        group_id: { in: activeGroupIds },
      },
      select: groupSelect,
    });

    const groups = formatGroups(rawGroups);
    const groupMap = new Map(groups.map((g) => [g.group_id, g]));

    // 5. Create Maps for efficient O(1) data merging
    const studyTimeMap = new Map(
      studyTimes.map((item) => [item.userId, item.studyTime]),
    );
    const statusMap = new Map(
      statuses.map((item) => [item.userId, item.status]),
    );
    const activeGroupMap = new Map(
      activeGroups.map((item) => [item.userId, item.activeGroup]),
    );

    // 6. Combine all data in a single, efficient loop
    const formattedFriends = friends.map((friend) => {
      const activeGroup = activeGroupMap.get(friend.user_id);
      const fullGroup =
        activeGroup && groupMap.get(activeGroup.group_id)
          ? groupMap.get(activeGroup.group_id)
          : null;

      return {
        ...friend,
        study_time: studyTimeMap.get(friend.user_id) || 0,
        status: statusMap.get(friend.user_id) || null,
        active_group: fullGroup
          ? { ...fullGroup, time: activeGroup?.time }
          : null,
      };
    });

    const now = nowSec();

    formattedFriends.sort(
      (a, b) =>
        (a.status?.start_time || now + 1) - (b.status?.start_time || now + 1),
    );

    res.send({ success: true, data: { friends: formattedFriends } });
  } catch (error) {
    next(error);
  }
};

export const getFriendSearch = async (
  req: Request<{}, {}, {}, GetFriendSearchQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req.query;

    console.log(query, 'query');

    const users = await prisma.users.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        user_id: true,
        name: true,
        timezone: true,
      },
      take: 10,
    });
    res.send({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

export const deleteFriend = async (
  req: Request<FriendIdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const friendId = req.params.friend_id;

    const deletedFriend = await prisma.friends.deleteMany({
      where: {
        OR: [
          { friend_id: friendId, user_id: userId },
          { friend_id: userId, user_id: friendId },
        ],
      },
    });

    if (deletedFriend.count) {
      filterCachedUserFriends(userId, friendId);
      filterCachedUserFriends(friendId, userId);

      res.send({ success: true, message: 'Deleted friend' });
    } else {
      res.send({ success: false, message: 'Friend not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const postFriendRequest = async (
  req: Request<FriendIdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const friendId = req.params.friend_id;

    const response = await friendRequest(userId, friendId);

    res.send(response);
  } catch (error) {
    next(error);
  }
};

export const postFriendRequestReply = async (
  req: Request<FriendshipIdParams, {}, PostFriendRequestReplyBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const friendshipId = req.params.friendship_id;
    const isAccepted = req.body.accepted;

    const response = await replyFriendRequest(userId, friendshipId, isAccepted);

    res.status(response.status).send(response);
  } catch (error) {
    next(error);
  }
};
