import { NextFunction, Request, Response } from 'express';

import { AppErrorFactory } from '../libs/errors';
import {
  getCachedUser,
  getCachedUserFriends,
  getCachedUserGroups,
} from '../services/cacheService';
import { getSubjects } from '../services/subjectService';
import { GetUserProfileQuery, UserIdParams } from '../types/userTypes';

export const getUserProfile = async (
  req: Request<UserIdParams, {}, {}, GetUserProfileQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.user_id;
    const { timezone } = req.query;

    const userInfo = await getCachedUser({ userId });
    if (!userInfo) {
      const response = AppErrorFactory.userNotFound();
      res.status(response.status).send(response);
      return;
    }

    const [friends, groups, subjects] = await Promise.all([
      getCachedUserFriends({ userId }),
      getCachedUserGroups({ userId }),
      getSubjects(userId, timezone),
    ]);

    res.status(200).send({
      success: true,
      status: 200,
      data: {
        userinfo: { ...userInfo, groups },
        friends,
        subjects: subjects.subjects,
        grouped_subjects: subjects.groupedSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* export const getUserStatus = async (
  req: Request<UserIdParams, {}, {}, GetUserStatusQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.user_id;
    const { timezone } = req.query;

    const

    res.status(200).send({
      success: true,
      status: 200,
      data: {
        userinfo: { ...userInfo, groups },
        friends,
        subjects: subjects.subjects,
        grouped_subjects: subjects.groupedSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
}; */
