import { REDIS_TTL } from '../libs/constants';
import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import redisClient from '../models/redisClient';
import { UserInfo, UserStatus } from '../types/accountTypes';
import { Viewer } from '../types/otherTypes';
import { RawRanking } from '../types/rankingTypes';
import { googleOauth2client, refreshGoogleAccessToken } from './authService';

interface GetCacheParams {
  update?: boolean;
  query?: boolean;
}

interface GetViewTimezoneCacheParams extends GetCacheParams {
  viewer: Viewer;
  timezoneOffset: number;
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
  let userInfo: UserInfo | null = null;

  try {
    const cachedData = await redisClient.hgetall(cacheKey);

    if (cachedData && Object.keys(cachedData).length > 0) {
      userInfo = {
        user_id: userId,
        name: cachedData.name,
        timezone: cachedData.timezone,
        created_at: Number(cachedData.created_at),
      };
    }

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
        await cacheUser(dbUser);
      }

      userInfo = dbUser;
    }

    return userInfo;
  } catch (err) {
    console.error(`Failed to get cached user: ${userId}`, err);
    return null;
  }
};
interface GetCachedUsersParams extends GetCacheParams {
  userIds: string[];
}

export const getCachedUsers = async ({
  userIds,
  update = false,
  query = true,
}: GetCachedUsersParams): Promise<UserInfo[]> => {
  if (!userIds.length) return [];

  const usersInfo: UserInfo[] = [];
  const notCached: string[] = [];

  try {
    const pipeline = redisClient.pipeline();
    userIds.forEach((id) => pipeline.hgetall(`user:${id}`));
    const results = await pipeline.exec();
    results?.forEach(([err, data], idx) => {
      const userId = userIds[idx];

      if (err || !data || Object.keys(data).length === 0) {
        notCached.push(userId);
        return;
      }

      const userData = data as UserInfo;

      usersInfo.push({
        user_id: userId,
        name: userData.name,
        timezone: userData.timezone,
        created_at: Number(userData.created_at),
      });
    });
    if (!notCached.length || !query) return usersInfo;

    const dbUsers = await prisma.users.findMany({
      where: { user_id: { in: notCached } },
      select: {
        user_id: true,
        name: true,
        timezone: true,
        created_at: true,
      },
    });

    if (update) {
      await Promise.all(dbUsers.map(cacheUser));
    }

    usersInfo.push(...dbUsers);
    return usersInfo;
  } catch (err) {
    console.error('Failed to get cached users:', err);
    return usersInfo;
  }
};

export const cacheUser = async (userInfo: UserInfo): Promise<void> => {
  const cacheKey = `user:${userInfo.user_id}`;
  try {
    await redisClient.hmset(cacheKey, {
      user_id: userInfo.user_id,
      name: userInfo.name || '',
      timezone: userInfo.timezone || '',
      created_at: userInfo.created_at.toString(),
    });
    await redisClient.expire(cacheKey, REDIS_TTL.USER_EXP);
  } catch (err) {
    console.error(`Failed to cache user: ${userInfo.user_id}`, err);
  }
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

  try {
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
  } catch (err) {
    console.log(err);
    return [];
  }
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

  try {
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
      cacheUserGroups(userId, groupsList);
    }

    return groupsList;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const cacheUserGroups = async (
  userId: string,
  groupIds: string[],
): Promise<void> => {
  const cacheKey = `user:${userId}:groups`;

  try {
    await redisClient.sadd(cacheKey, 'cached', ...groupIds);
    await redisClient.expire(cacheKey, REDIS_TTL.USER_GROUPS_EXP);
  } catch (err) {
    console.error(`Failed to cache groups: ${userId}`, err);
  }
};

export const delCachedUserGroups = async (userId: string): Promise<void> => {
  const cacheKey = `user:${userId}:groups`;

  try {
    await redisClient.del(cacheKey, 'cached');
  } catch (err) {
    console.error(`Failed to del groups: ${userId}`, err);
  }
};

export const filterCachedUserGroups = async (
  userId: string,
  groupId: string,
): Promise<void> => {
  const cacheKey = `user:${userId}:groups`;

  await redisClient.srem(cacheKey, groupId);
};

interface CacheUserStatusParams {
  userId: string;
  subjectId?: string;
  name?: string;
  startTime: number;
}

export const cacheUserStatus = async ({
  userId,
  subjectId = '0',
  name = 'Taking break',
  startTime,
}: CacheUserStatusParams) => {
  const cacheKey = `user:${userId}:status`;

  try {
    await redisClient.hset(
      cacheKey,
      'subject_id',
      subjectId,
      'start_time',
      startTime.toString(),
      'name',
      name,
    );

    redisClient.expire(
      `user:${userId}:activeSubject`,
      REDIS_TTL.USER_STATUS_EXP,
    );
  } catch (err) {
    console.log(err);
  }
};

export const getCachedUserStatus = async (
  userId: string,
): Promise<UserStatus | null> => {
  const cacheKey = `user:${userId}:status`;

  try {
    const status = await redisClient.hgetall(cacheKey);
    if (!status || Object.keys(status).length === 0) {
      return null;
    }
    if (!(status.subject_id && status.name && status.start_time)) return null;

    return {
      subject_id: status.subject_id,
      name: status.name,
      start_time: Number(status.start_time),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const delCachedUserStatus = async (userId: string) => {
  const cacheKey = `user:${userId}:status`;
  try {
    await redisClient.del(cacheKey);
  } catch (err) {
    console.log(err);
  }
};

export const getCachedRanking = async ({
  viewer,
  timezoneOffset,
}: GetViewTimezoneCacheParams): Promise<RawRanking[]> => {
  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    const rawRanking = await redisClient.zrevrange(
      cacheKey,
      0,
      -1,
      'WITHSCORES',
    );

    const rankings = [];

    for (let i = 0; i < rawRanking.length; i += 2) {
      const study_time = Number(rawRanking[i + 1]);
      if (study_time) {
        rankings.push({
          user_id: rawRanking[i],
          rank: Math.floor(i / 2) + 1,
          study_time,
        });
      }
    }
    return rankings;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const cacheRanking = async (
  userId: string,
  viewer: Viewer,
  timezoneOffset: number,
  value: number,
) => {
  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    redisClient.zincrby(cacheKey, value, userId);
  } catch (err) {
    console.log(err);
  }
};

export const delCacheRanking = async (
  viewer: Viewer,
  timezoneOffset: number,
) => {
  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    redisClient.del(cacheKey);
  } catch (err) {
    console.log(err);
  }
};

interface GetCachedUserRankingParams extends GetViewTimezoneCacheParams {
  userId: string;
}

export const getCachedUserRanking = async ({
  userId,
  viewer,
  timezoneOffset,
}: GetCachedUserRankingParams): Promise<number | null> => {
  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    const rawRanking = await redisClient.zrevrank(cacheKey, userId);
    return typeof rawRanking === 'number' ? rawRanking + 1 : null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

interface GetCachedUserStudyTimeParams extends GetViewTimezoneCacheParams {
  userId: string;
}

export const getCachedUserStudyTime = async ({
  userId,
  viewer,
  timezoneOffset,
}: GetCachedUserStudyTimeParams): Promise<number> => {
  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    const studyTime = await redisClient.zscore(cacheKey, userId);
    return typeof studyTime === 'number' ? studyTime : 0;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

export const cacheUserGoogleAccessToken = async (
  userId: string | undefined,
  token: string | undefined | null,
  expiration: number | undefined | null,
) => {
  if (!token || !userId || !expiration) return;

  const now = nowSec();
  const exp = Math.floor(expiration / 1000) - now;

  if (exp <= 0) return;

  const key = `user:${userId}:google_access_token`;
  await redisClient.set(key, token);
  await redisClient.expire(key, exp);
};

export const getCacheUserGoogleAccessToken = async (userId: string) => {
  const key = `user:${userId}:google_access_token`;

  try {
    const googleAccessToken = await redisClient.get(key);

    if (googleAccessToken) {
      return googleAccessToken;
    }

    const userInfo = await prisma.users.findFirst({
      where: { user_id: userId },
      select: { google_refresh_token: true },
    });

    if (!userInfo || !userInfo.google_refresh_token) {
      return null;
    }
    const newAccessToken = await refreshGoogleAccessToken(
      userInfo.google_refresh_token,
    );

    if (!newAccessToken) return null;

    await redisClient.set(key, newAccessToken);

    return newAccessToken;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const delCacheUserGoogleAccessToken = async (userId: string) => {
  const key = `user:${userId}:google_access_token`;
  redisClient.del(key);
};

/**
 * Fetches study times for multiple users in a single Redis round-trip.
 */
export const getCachedUsersStudyTime = async ({
  userIds,
  viewer,
  timezoneOffset,
}: {
  userIds: string[];
  viewer: 'day';
  timezoneOffset: number;
}): Promise<{ userId: string; studyTime: number }[]> => {
  if (userIds.length === 0) return [];

  try {
    const cacheKey = `studytime:${viewer}:timezone:${timezoneOffset}`;
    const pipeline = redisClient.pipeline();
    userIds.forEach((userId) => {
      pipeline.zscore(cacheKey, userId);
    });

    const results = await pipeline.exec();

    if (!results) {
      console.error('Redis pipeline for study times failed, returning null.');
      return userIds.map((userId) => ({ userId, studyTime: 0 }));
    }

    return userIds.map((userId, index) => {
      const [error, score] = results[index];
      const studyTime = typeof score === 'string' ? parseFloat(score) : 0;
      return { userId, studyTime };
    });
  } catch (err) {
    console.error('Error fetching bulk study times from Redis:', err);
    // Return a default value to prevent the entire request from failing
    return userIds.map((userId) => ({ userId, studyTime: 0 }));
  }
};

/**
 * Fetches statuses for multiple users in a single Redis round-trip.
 */
export const getCachedUsersStatus = async (
  userIds: string[],
): Promise<{ userId: string; status: UserStatus | null }[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const pipeline = redisClient.pipeline();
  userIds.forEach((userId) => {
    pipeline.hgetall(`user:${userId}:status`);
  });

  // 1. Correctly type the result from `pipeline.exec()` as returning `unknown`.
  //    This acknowledges that TypeScript can't know the shape of the data.
  const results: [error: Error | null, result: unknown][] | null =
    await pipeline.exec();

  if (!results) {
    console.error('Redis pipeline for user statuses failed, returning null.');
    return userIds.map((userId) => ({ userId, status: null }));
  }

  return userIds.map((userId, index) => {
    const [error, rawResult] = results[index];

    // 2. Perform runtime checks to ensure we have a usable object.
    if (error || typeof rawResult !== 'object' || rawResult === null) {
      if (error) {
        console.error(`Error in HGETALL pipeline for user ${userId}:`, error);
      }
      return { userId, status: null };
    }

    // 3. FIX: Use a type assertion (`as`) to tell the compiler the shape of the object.
    //    This is the key step. We are guaranteeing the type based on our runtime checks
    //    and our knowledge that `hgetall` returns a string-to-string record.
    const statusHash = rawResult as Record<string, string>;

    // 4. Now we can safely access properties because `statusHash` is correctly typed.
    if (!statusHash.subject_id) {
      // This handles cases where the hash exists but is empty.
      return { userId, status: null };
    }

    return {
      userId,
      status: {
        subject_id: statusHash.subject_id,
        name: statusHash.name,
        start_time: Number(statusHash.start_time),
      },
    };
  });
};
