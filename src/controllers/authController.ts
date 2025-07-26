import { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import { nanoid } from 'nanoid';

import config from '../config/config';
import prisma from '../libs/prisma';
import {
  createUser,
  googleOauth2client,
  loginUser,
  setSessionCookie,
} from '../services/authService';
import { cacheUserGoogleAccessToken } from '../services/cacheService';
import {
  createSession,
  deleteSession,
  getUserIdByToken,
} from '../services/sessionService';
import { createSubject } from '../services/subjectService';
import {
  GetAuthGoogleCallbackQuery,
  PostAuthLoginBody,
  PostSignupBody,
} from '../types/authTypes';

export const postAuthSignup = async (
  req: Request<{}, {}, PostSignupBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, timezone, password } = req.body;

    const newUserResponse = await createUser({
      name,
      email,
      timezone,
      password,
    });
    const newUser = newUserResponse.data?.user;

    if (!newUserResponse.success || !newUser) {
      res.send(newUserResponse);
      return;
    }

    await createSubject({
      name: 'others',
      color: '#000000',
      user: {
        connect: { user_id: newUser.user_id },
      },
    });

    const token = await createSession(newUser.user_id);

    setSessionCookie(res, token);

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const postAuthLogin = async (
  req: Request<{}, {}, PostAuthLoginBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });
    const token = await createSession(user.user_id);

    setSessionCookie(res, token);

    res.send({ success: true, token });
  } catch (error) {
    next(error);
  }
};

export const postAuthLogout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    res.clearCookie('token');

    deleteSession(userId);

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getAuthGoogleCallback = async (
  req: Request<{}, {}, {}, GetAuthGoogleCallbackQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, state } = req.query;
    const decodedState = JSON.parse(decodeURIComponent(state));
    const timezone = decodedState.timezone;

    const auth = googleOauth2client();
    const response = await auth?.getToken(code);

    if (!auth || response?.res?.status !== 200 || !response.tokens) {
      res.status(400).json({
        success: false,
        message:
          'Failed to retrieve access token from Google. Please try signing in again.',
        error: {
          reason: 'OAuth token exchange failed',
          status: response?.res?.status,
        },
      });
      return;
    }

    auth.setCredentials(response.tokens);

    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    const userId = await getUserIdByToken(token);

    // Existing logged-in user: link Google refresh token
    if (userId) {
      await prisma.users.update({
        where: { user_id: userId },
        data: { google_refresh_token: response.tokens.refresh_token },
      });
      cacheUserGoogleAccessToken(
        userId,
        response.tokens.access_token,
        response.tokens.expiry_date,
      );
      return res.redirect(config.nextServer + '/dashboard/account');
    }

    // Not logged in: fetch user info from Google
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const userInfoResponse = await oauth2.userinfo.get();
    const { email, name } = userInfoResponse.data;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve email from Google account.',
        error: { reason: 'Missing email in Google user info' },
      });
      return;
    }

    const existingUser = await prisma.users.findFirst({
      where: { email },
      select: { user_id: true },
    });

    // Existing user: log in
    if (existingUser?.user_id) {
      const sessionToken = await createSession(existingUser.user_id);

      setSessionCookie(res, sessionToken);

      await prisma.users.update({
        where: { user_id: existingUser.user_id },
        data: { google_refresh_token: response.tokens.refresh_token },
      });

      cacheUserGoogleAccessToken(
        existingUser.user_id,
        response.tokens.access_token,
        response.tokens.expiry_date,
      );

      return res.redirect(config.nextServer + '/dashboard/account');
    }

    // New user
    const password = nanoid(10);
    const newUserResponse = await createUser({
      name,
      email,
      timezone,
      password,
    });

    const newUser = newUserResponse.data?.user;

    if (!newUserResponse.success || !newUser)
      return res.redirect(config.nextServer);

    await createSubject({
      name: 'others',
      color: '#000000',
      user: { connect: { user_id: newUser.user_id } },
    });

    const sessionToken = await createSession(newUser.user_id);
    setSessionCookie(res, sessionToken);

    cacheUserGoogleAccessToken(
      newUser.user_id,
      response.tokens.access_token,
      response.tokens.expiry_date,
    );

    return res.redirect(config.nextServer + '/dashboard?welcome=true');
  } catch (error) {
    next(error);
  }
};
