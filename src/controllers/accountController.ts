import * as fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import { google, oauth2_v2 } from 'googleapis';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { bcryptHash } from '../libs/utils';
import { googleOauth2client } from '../services/authService';
import {
  delCachedUser,
  deleteUserRedisData,
  getCachedUser,
  getCacheUserGoogleAccessToken,
} from '../services/cacheService';
import { extendSession } from '../services/sessionService';
import {
  PatchAccountInfoBody,
  PatchAccountPasswordBody,
} from '../types/accountTypes';

export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //! can be used because it passed the middleware
    const userId = req.user_id!;

    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    extendSession(token);

    const userinfo = await getCachedUser({ userId });

    res.send({ success: true, data: { userinfo } });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    // 1. **Delete Related Records:** Delete all records where userId is a foreign key.
    //    We use a transaction to ensure atomicity (all or nothing).
    await prisma.$transaction([
      // Delete from all simple one-to-many/many-to-many join tables first
      prisma.chatroom_members.deleteMany({ where: { user_id: userId } }),
      prisma.chatroom_messages.deleteMany({ where: { user_id: userId } }),
      prisma.devices.deleteMany({ where: { user_id: userId } }),
      // Handle friends: delete where user is sender OR receiver
      prisma.friends.deleteMany({
        where: { OR: [{ user_id: userId }, { friend_id: userId }] },
      }),
      prisma.group_likes.deleteMany({ where: { user_id: userId } }),
      prisma.group_members.deleteMany({ where: { user_id: userId } }),
      // Notifications: If you changed 'onDelete: Cascade' to 'SetNull' on 'sender_id',
      // this only deletes notifications *to* the user.
      prisma.notifications.deleteMany({ where: { user_id: userId } }),
      prisma.ranking_details.deleteMany({ where: { user_id: userId } }),
      prisma.subjects.deleteMany({ where: { user_id: userId } }),
      prisma.theme_likes.deleteMany({ where: { user_id: userId } }),
      prisma.themes.deleteMany({ where: { user_id: userId } }), // Deletes themes created by user
      prisma.user_themes.deleteMany({ where: { user_id: userId } }),
      prisma.website_settings.deleteMany({ where: { user_id: userId } }),
      prisma.website_usage.deleteMany({ where: { user_id: userId } }),

      // 2. **Delete Parent Record (users):** This will also delete groups where the user is the leader,
      //    due to the `onDelete: Cascade` you set on the `groups` model.
      prisma.users.delete({
        where: {
          user_id: userId,
        },
      }),
    ]);

    await deleteUserRedisData(userId);

    res.send({ success: true, message: 'Account deleted' });
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

    res.send({ success: true, message: 'Account information updated' });
  } catch (error) {
    next(error);
  }
};

export const patchAccountPassword = async (
  req: Request<{}, {}, PatchAccountPasswordBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { password } = req.body;

    const hashed_password = await bcryptHash(password);

    await prisma.users.update({
      where: { user_id: userId },
      data: { hashed_password, salt: null, hashed_password_type: 'bcrypt' },
    });

    res.send({ success: true, message: 'Account password updated' });
  } catch (error) {
    next(error);
  }
};

export const putAccountProfileImage = async (
  req: Request<{}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    console.log(userId, req.file?.path);

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const newFilename = `${userId}.jpeg`;
    // Use the UPLOAD_DIR constant for the destination path
    const newFilePath = path.join(
      __dirname,
      '../public/img/profile-images',
      newFilename,
    );

    fs.rename(req.file.path, newFilePath, (err) => {
      if (err) {
        console.error('File renaming failed:', err);
        // Clean up the temporary file in case of an error.
        fs.unlinkSync(req.file!.path);
        return res
          .status(500)
          .json({ success: false, message: 'Failed to save file.' });
      }

      console.log(`File uploaded successfully as: ${newFilePath}`);
      return res.status(200).json({
        success: true,
        message: `Profile image changed".`,
      });
    });
  } catch (error) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
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
      const response = AppErrorFactory.tokenMissing('');
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
