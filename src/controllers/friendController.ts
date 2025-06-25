import { NextFunction, Request, Response } from 'express';

import { friendRequest, replyFriendRequest } from '../services/friendService';
import {
  FriendIdParams,
  FriendshipIdParams,
  PostFriendRequestReplyBody,
} from '../types/friendTypes';

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
