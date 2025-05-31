import { NextFunction, Request, Response } from 'express';

import { getCachedUser, getCachedUserFriends } from '../services/cacheService';
import { SignupRequestBody } from '../types/authTypes';

export const getAccount = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    //! can be used because it passed the middleware
    const userId = req.user_id!;
    const userinfo = await getCachedUser({ userId });
    const friends = await getCachedUserFriends({ userId });
    res.send({ success: true, data: { userinfo, friends } });
  } catch (error) {
    next(error);
  }
};
