import { nanoid } from 'nanoid';

import { REDIS_TTL } from '../libs/constants';
import redisClient from '../models/redisClient';

export const createSession = async (userId: string) => {
  const token = nanoid(32);
  await redisClient.set(
    `session:${token}`,
    userId,
    'EX',
    REDIS_TTL.SESSION_EXP,
  );
  return token;
};

export const getUserIdByToken = async (token: string) => {
  return await redisClient.get(`session:${token}`);
};

export const deleteSession = async (token: string) => {
  await redisClient.del(`session:${token}`);
};
