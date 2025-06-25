import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import {
  filterCachedUserFriends,
  getCachedUserFriends,
} from '../services/cacheService';
import { friendRequest, replyFriendRequest } from '../services/friendService';
import {
  FriendIdParams,
  FriendshipIdParams,
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
