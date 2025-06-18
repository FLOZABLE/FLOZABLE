import crypto from 'crypto';
import { Response } from 'express';
import { google } from 'googleapis';
import { nanoid } from 'nanoid';

import config from '../config/config';
import { Prisma } from '../generated/prisma/client';
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
}: CreateUserParams) => {
  const created_at = nowSec();
  const user_id = nanoid(10);
  const hashed_password = await bcryptHash(password);

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

  return newUser;
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
  try {
    const auth = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri,
    );
    return auth;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: COOKIE_TTL.LOGIN_TOKEN_EXP,
  });
}
