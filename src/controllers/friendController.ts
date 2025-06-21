import { NextFunction, Request, Response } from 'express';

import { friendRequest } from '../services/friendService';
import { PostFriendRequestParams } from '../types/friendTypes';

export const postFriendRequest = async (
  req: Request<PostFriendRequestParams>,
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
