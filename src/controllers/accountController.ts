import { NextFunction, Request, Response } from 'express';
import { google, oauth2_v2 } from 'googleapis';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { googleOauth2client } from '../services/authService';
import {
  delCachedUser,
  getCachedUser,
  getCachedUserFriends,
  getCachedUserGroups,
  getCacheUserGoogleAccessToken,
} from '../services/cacheService';
import { getSubjects } from '../services/subjectService';
import {
  GetAccountProfileParams,
  GetAccountProfileQuery,
  PatchAccountInfoBody,
} from '../types/accountTypes';

export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //! can be used because it passed the middleware
    const userId = req.user_id!;

    const userinfo = await getCachedUser({ userId });

    res.send({ success: true, data: { userinfo } });
  } catch (error) {
    next(error);
  }
};

export const patchAccountInfo = async (
  req: Request<{}, {}, PatchAccountInfoBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { name, email } = req.body;

    await prisma.users.update({
      where: { user_id: userId },
      data: { name, email },
    });

    delCachedUser(userId);

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const patchAccountPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const userinfo = await getCachedUser({ userId });

    res.send({ success: true, data: { userinfo } });
  } catch (error) {
    next(error);
  }
};

export const getAccountGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const googleAccessToken = await getCacheUserGoogleAccessToken(userId);

    if (!googleAccessToken) {
      const response = AppErrorFactory.tokenMissing();
      res.status(response.status).send(response);
      return;
    }

    const auth = googleOauth2client();
    auth.setCredentials({ access_token: googleAccessToken });

    const oauth2 = google.oauth2({
      auth,
      version: 'v2',
    });

    const [accessTokenInfo, userInfoResponse] = await Promise.all([
      auth.getTokenInfo(googleAccessToken),
      oauth2.userinfo.get(),
    ]);

    const google_info: oauth2_v2.Schema$Userinfo & { scopes: string[] } = {
      ...userInfoResponse.data,
      scopes: accessTokenInfo.scopes,
    };

    res.send({ success: true, data: { google_info } });
  } catch (error) {
    next(error);
  }
};

export const getAccountProfile = async (
  req: Request<GetAccountProfileParams, {}, {}, GetAccountProfileQuery>,
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
