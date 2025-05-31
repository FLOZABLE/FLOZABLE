import { REDIS_TTL } from '../libs/constants';
import prisma from '../libs/prisma';
import redisClient from '../models/redisClient';
import { UserInfo } from '../types/accountType';

interface GetCacheParams {
  update?: boolean;
  query?: boolean;
}

interface GetCachedUserParams extends GetCacheParams {
  userId: string;
}

export const getCachedUser = async ({
  userId,
  update = true,
  query = true,
}: GetCachedUserParams): Promise<UserInfo | null> => {
  const cacheKey = `user:${userId}`;

  // Try getting from Redis first
  let userInfo: UserInfo | null = null;
  const cachedData = await redisClient.hgetall(cacheKey);
  if (cachedData && Object.keys(cachedData).length > 0) {
    userInfo = {
      user_id: userId,
      name: cachedData.name,
      timezone: cachedData.timezone,
      created_at: parseInt(cachedData.created_at),
    };
  }

  // If not found in Redis and allowed to query DB
  if (!userInfo && query) {
    const dbUser = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        timezone: true,
        created_at: true,
      },
    });

    if (!dbUser) return null;

    if (update) {
      await redisClient.hmset(cacheKey, {
        user_id: dbUser.user_id,
        name: dbUser.name || '',
        timezone: dbUser.timezone || '',
        created_at: dbUser.created_at.toString(),
      });
      await redisClient.expire(cacheKey, REDIS_TTL.USER_EXP);
    }

    userInfo = dbUser;
  }

  return userInfo;
};

interface GetCachedUserFriendsParams extends GetCacheParams {
  userId: string;
}

export const getCachedUserFriends = async ({
  userId,
  update = true,
  query = true,
}: GetCachedUserFriendsParams): Promise<string[]> => {
  const cacheKey = `user:${userId}:friends`;

  const cachedFriends = await redisClient.smembers(cacheKey);

  if (cachedFriends.length) {
    return cachedFriends.filter((key) => key !== 'cached');
  }

  if (!query) return [];

  const dbFriends = await prisma.friends.findMany({
    where: {
      OR: [
        { user_id: userId, status: 'accepted' },
        { friend_id: userId, status: 'accepted' },
      ],
    },
    select: {
      friend_id: true,
      user_id: true,
    },
  });

  if (!dbFriends.length) return [];

  const friendsList = dbFriends.map((friend) =>
    friend.friend_id === userId ? friend.user_id : friend.friend_id,
  );

  if (update) {
    await redisClient.sadd(cacheKey, 'cached', ...friendsList);
    await redisClient.expire(cacheKey, REDIS_TTL.USER_FRIENDS_EXP);
  }

  return friendsList;
};

interface GetCachedUserGroupsParams extends GetCacheParams {
  userId: string;
}

export const getCachedUserGroups = async ({
  userId,
  update = true,
  query = true,
}: GetCachedUserGroupsParams): Promise<string[]> => {
  const cacheKey = `user:${userId}:groups`;

  const cachedGroups = await redisClient.smembers(cacheKey);

  if (cachedGroups.length) {
    return cachedGroups.filter((key) => key !== 'cached');
  }

  if (!query) return [];

  const dbGroups = await prisma.group_members.findMany({
    where: { user_id: userId },
    select: { group_id: true },
  });

  const groupsList = dbGroups.map((group) => group.group_id);

  if (update) {
    await redisClient.sadd(cacheKey, 'cached', ...groupsList);
    await redisClient.expire(cacheKey, REDIS_TTL.USER_GROUPS_EXP);
  }

  return groupsList;
};
