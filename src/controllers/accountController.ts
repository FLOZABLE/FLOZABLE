import { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { GaxiosError } from 'gaxios';
import { google, oauth2_v2 } from 'googleapis';

import { AppErrorFactory } from '../libs/errors';
import { googleOauth2client } from '../services/authService';
import {
  delCacheUserGoogleAccessToken,
  getCachedUser,
  getCachedUserFriends,
  getCacheUserGoogleAccessToken,
} from '../services/cacheService';

export const getAccount = async (
  req: Request,
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
