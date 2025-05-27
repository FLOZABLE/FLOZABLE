import crypto from 'crypto';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma/client';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { bcryptHash, bcryptVerify, nowSec } from '../libs/utils';

type CreateUserParams = Omit<
  Prisma.usersCreateInput,
  'user_id' | 'hashed_password' | 'hashed_password_type' | 'created_at'
> & {
  password: string;
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
      name,
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
