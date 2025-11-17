import appleSignin from 'apple-signin-auth';
import { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import { nanoid } from 'nanoid';

import config from '../config/config';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import {
  appleAuthOptions,
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
  PostAuthAppGoogleBody,
  PostAuthAppleBody,
  PostAuthLoginAppBody,
  PostAuthLoginBody,
  PostAuthTokenVerifyBody,
  PostSignupAppBody,
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

export const postAuthSignupApp = async (
  req: Request<{}, {}, PostSignupAppBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, timezone, password, brand, device_id, device_name } =
      req.body;

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

    const created_at = nowSec();

    await prisma.devices.create({
      data: {
        device_id,
        user_id: newUser.user_id,
        brand,
        name: device_name,
        token,
        created_at,
      },
    });

    setSessionCookie(res, token);

    res.send({
      success: true,
      data: {
        user_id: newUser.user_id,
        token,
      },
    });
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

export const postAuthLoginApp = async (
  req: Request<{}, {}, PostAuthLoginAppBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, device_id, device_name, brand } = req.body;

    const user = await loginUser({ email, password });
    const token = await createSession(user.user_id);

    await prisma.devices.deleteMany({
      where: {
        device_id,
      },
    });

    const created_at = nowSec();

    const userId = user.user_id;

    await prisma.devices.create({
      data: {
        device_id,
        user_id: userId,
        brand,
        name: device_name,
        token,
        created_at,
      },
    });

    setSessionCookie(res, token);

    res.send({
      success: true,
      data: {
        user_id: userId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles Google authentication for mobile applications.
 *
 * This function processes the authorization code from a mobile app's Google login flow.
 * It handles three cases:
 * 1. The Google account's email already exists in the database. The user is logged in.
 * 2. The Google account's email is new. A new user account is created.
 * 3. The OAuth token exchange fails. An error response is returned.
 *
 * All flows result in a session token being created and a new device record being
 * stored in the database, with any old device records for the same device ID being removed first.
 *
 * @param req The Express request object containing the Google auth code and device info.
 * @param res The Express response object.
 * @param next The Express next function for error handling.
 */
export const postAuthAppGoogle = async (
  req: Request<{}, {}, PostAuthAppGoogleBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, timezone, device_id, device_name, brand } = req.body;

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

    // Fetch user info from Google
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

    let userId: string;

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email },
      select: { user_id: true },
    });

    if (existingUser?.user_id) {
      // Case 1: Existing user
      userId = existingUser.user_id;

      await prisma.users.update({
        where: { user_id: userId },
        data: { google_refresh_token: response.tokens.refresh_token },
      });
    } else {
      // Case 2: New user
      const password = nanoid(10);
      const newUserResponse = await createUser({
        name,
        email,
        timezone,
        password,
      });
      const newUser = newUserResponse.data?.user;

      if (!newUserResponse.success || !newUser) {
        res.status(400).json({
          success: false,
          message: 'Failed to create new user account.',
        });
        return;
      }
      userId = newUser.user_id;

      // Create a default subject for the new user
      await createSubject({
        name: 'others',
        color: '#000000',
        user: { connect: { user_id: userId } },
      });
    }

    // Common logic for both new and existing users
    const token = await createSession(userId);
    cacheUserGoogleAccessToken(
      userId,
      response.tokens.access_token,
      response.tokens.expiry_date,
    );

    // Remove any previous device records for this device ID to prevent duplicates
    await prisma.devices.deleteMany({
      where: {
        device_id,
      },
    });

    // Create a new device record
    const created_at = nowSec();
    await prisma.devices.create({
      data: {
        device_id,
        user_id: userId,
        brand,
        name: device_name,
        token,
        created_at,
      },
    });

    setSessionCookie(res, token);

    res.send({
      success: true,
      data: {
        user_id: userId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const postAuthApple = async (
  req: Request<{}, {}, PostAuthAppleBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, timezone, device_id, device_name, brand } = req.body;

    const tokenResponse = await appleSignin.getAuthorizationToken(
      code,
      appleAuthOptions,
    );

    const idToken = tokenResponse.id_token;

    // Use apple-signin to decode and verify the token's signature
    const decodedToken = await appleSignin.verifyIdToken(idToken, {
      clientID: config.appleClientId,
      // The verification process automatically checks the issuer, audience, and expiration
    });

    // The decodedToken (the JWT payload) contains the claims:
    const email = decodedToken.email; // The user's email

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve email from Apple account.',
        error: { reason: 'Missing email in Apple user info' },
      });
      return;
    }

    let userId: string;

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email },
      select: { user_id: true },
    });

    if (existingUser?.user_id) {
      // Case 1: Existing user
      userId = existingUser.user_id;
    } else {
      // Case 2: New user
      const password = nanoid(10);
      const name = req.body.name ? req.body.name : `user=${nanoid(7)}`;
      const newUserResponse = await createUser({
        name,
        email,
        timezone,
        password,
      });
      const newUser = newUserResponse.data?.user;

      if (!newUserResponse.success || !newUser) {
        res.status(400).json({
          success: false,
          message: 'Failed to create new user account.',
        });
        return;
      }
      userId = newUser.user_id;

      // Create a default subject for the new user
      await createSubject({
        name: 'others',
        color: '#000000',
        user: { connect: { user_id: userId } },
      });
    }

    // Common logic for both new and existing users
    const token = await createSession(userId);

    // Remove any previous device records for this device ID to prevent duplicates
    await prisma.devices.deleteMany({
      where: {
        device_id,
      },
    });

    // Create a new device record
    const created_at = nowSec();
    await prisma.devices.create({
      data: {
        device_id,
        user_id: userId,
        brand,
        name: device_name,
        token,
        created_at,
      },
    });

    setSessionCookie(res, token);

    res.send({
      success: true,
      data: {
        user_id: userId,
        token,
      },
    });
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
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    res.clearCookie('token');

    deleteSession(token);

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

export const postAuthTokenVerify = async (
  req: Request<{}, {}, PostAuthTokenVerifyBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { token, device_id } = req.body;

    const device = await prisma.devices.findFirst({
      where: {
        device_id,
        token,
        user_id: userId,
      },
    });

    if (!device) {
      const response = AppErrorFactory.tokenInvalid();
      res.status(response.statusCode).send(response);
      return;
    }

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    res.send({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};
