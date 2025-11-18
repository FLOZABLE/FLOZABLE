import crypto from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import appleSignin from 'apple-signin-auth';
import { Response } from 'express';
import { google } from 'googleapis';
import { HttpError } from 'http-errors';
import { nanoid } from 'nanoid';

import config from '../config/config';
import { Prisma } from '../generated/prisma';
import { COOKIE_TTL } from '../libs/constants';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { bcryptHash, bcryptVerify, nowSec } from '../libs/utils';

type CreateUserParams = Omit<
  Prisma.usersCreateInput,
  'name' | 'user_id' | 'hashed_password' | 'hashed_password_type' | 'created_at'
> & {
  password: string;
  name: string | undefined | null;
};

export const createUser = async ({
  name,
  email,
  timezone,
  password,
}: CreateUserParams): Promise<{
  success: boolean;
  status: number;
  data: null | { user: Prisma.usersUncheckedCreateInput };
  message: string;
  error: HttpError | null;
}> => {
  const created_at = nowSec();
  const user_id = nanoid(10);
  const hashed_password = await bcryptHash(password);

  try {
    const newUser = await prisma.users.create({
      data: {
        user_id,
        name: name ? name : user_id,
        email,
        timezone,
        hashed_password,
        hashed_password_type: 'bcrypt',
        created_at,
      },
    });

    return {
      success: true,
      status: 201,
      data: { user: newUser },
      message: 'Account created successfully!',
      error: null,
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002' &&
      typeof err.meta?.target === 'string' &&
      err.meta?.target.includes('users_email_key')
    ) {
      return {
        success: false,
        status: 409,
        message: 'This email is already registered.',
        error: AppErrorFactory.userAlreadyExists(),
        data: null,
      };
    }

    console.error('Failed to create user:', err);
    return {
      success: false,
      status: 500,
      message: 'Failed to create account due to server error.',
      error: AppErrorFactory.unknownServerError(),
      data: null,
    };
  }
};

type LoginUserParam = {
  email: string;
  password: string;
};

export const loginUser = async ({ email, password }: LoginUserParam) => {
  const user = await prisma.users.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
    select: {
      hashed_password_type: true,
      hashed_password: true,
      salt: true,
      user_id: true,
    },
  });
  if (!user) throw AppErrorFactory.invalidCredentials();

  let valid = false;
  if (user.hashed_password_type === 'bcrypt') {
    valid = await bcryptVerify(password, user.hashed_password);
  } else {
    if (!user.salt) throw AppErrorFactory.invalidCredentials();
    const newHash = crypto
      .pbkdf2Sync(password, user.salt, 99097, 32, 'sha512')
      .toString('hex');
    valid = newHash === user.hashed_password;
    if (valid) {
      const newBcryptHash = await bcryptHash(password);
      await updateUserHash(user.user_id, newBcryptHash);
    }
  }

  if (!valid) throw AppErrorFactory.passwordMismatch();
  return user;
};

export const updateUserHash = async (
  user_id: string,
  hashed_password: string,
) => {
  await prisma.users.update({
    where: {
      user_id,
    },
    data: {
      hashed_password,
      hashed_password_type: 'bcrypt',
    },
  });
};

export function googleOauth2client() {
  const auth = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri,
  );
  return auth;
}

export const refreshGoogleAccessToken = async (
  refreshToken: string,
): Promise<{ token: string; expiry_date: number } | null> => {
  try {
    const auth = googleOauth2client();
    auth.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await auth.refreshAccessToken();

    if (!credentials.access_token || !credentials.expiry_date) {
      throw new Error('Missing token or expiry date in refresh response');
    }

    return {
      token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    };
  } catch (err) {
    console.error('Error refreshing Google access token:', err);
    return null;
  }
};

export function setSessionCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: COOKIE_TTL.LOGIN_TOKEN_EXP,
  });
}

const filePath = path.resolve(
  __dirname,
  '../../credentials/AuthKey_X6AAH79R9J.p8',
);
const privateKey = readFileSync(filePath, 'utf8');

export const getAppleAuthOptions = () => {
  const appleClientSecret = appleSignin.getClientSecret({
    clientID: config.appleClientId, // Apple Client ID
    teamID: config.appleTeamId, // Apple Developer Team ID.
    privateKey: privateKey, // private key associated with your client ID. -- Or provide a `privateKeyPath` property instead.
    keyIdentifier: config.appleKeyId, // identifier of the private key.
  });

  return {
    clientID: config.appleClientId, // Apple Client ID
    redirectUri: config.appleRedirectUri, // use the same value which you passed to authorisation URL.
    clientSecret: appleClientSecret,
  };
};
