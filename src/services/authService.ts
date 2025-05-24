import prisma from '../libs/prisma';
import { nanoid } from 'nanoid';
import { bcryptHash, nowSec } from '../libs/utils';
import { Prisma } from '../generated/prisma/client';

type CreateUserParams = Omit<
  Prisma.UserCreateInput,
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

  const newUser = await prisma.user.create({
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
