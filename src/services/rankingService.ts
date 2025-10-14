import { DateTime } from 'luxon';
import moment from 'moment-timezone';
import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { Viewer } from '../types/otherTypes';
import { Ranking, RawRanking } from '../types/rankingTypes';
import {
  delCacheRanking,
  getCachedRanking,
  getCachedUsers,
} from './cacheService';

interface GetRankingsProps {
  timezone: string;
  viewer: Viewer;
  date: string;
  userIds?: string[];
}

export const getRankings = async ({
  timezone,
  viewer,
  date,
  userIds,
}: GetRankingsProps) => {
  try {
    const dateTime = DateTime.fromISO(date, { zone: timezone })
      .startOf('day')
      .startOf(viewer);

    const now = DateTime.now().setZone(timezone).startOf('day').startOf(viewer);

    const timezoneOffset = Math.floor(now.offset / 60);
    let rawRankings: RawRanking[] = [];
    if (now.toSeconds() === dateTime.toSeconds()) {
      //today/this week/this month = cached
      rawRankings = await getCachedRanking({ viewer, timezoneOffset, userIds });
    } else {
      const rankingsData = await prisma.ranking_details.findMany({
        where: {
          ranking: {
            date: dateTime.toSeconds(),
            mode: viewer,
            //timezone: timezoneOffset.toString(),
          },
          user_id: { in: userIds },
        },
        orderBy: {
          rank: 'asc',
        },
        select: {
          rank: true,
          user_id: true,
          study_time: true,
        },
      });

      console.log(rankingsData, dateTime.toSeconds(), viewer);

      rawRankings = rankingsData;
    }
    const users = await getCachedUsers({
      userIds: rawRankings.map((ranking) => ranking.user_id),
    });

    const rankings: Ranking[] = rawRankings
      .map((ranking) => {
        const user = users.find((user) => user.user_id === ranking.user_id);
        if (!user) return null;
        return { ...user, ...ranking, date: dateTime.toISODate() };
      })
      .filter((r): r is Ranking => !!r);

    return rankings;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const updateRanking = async () => {
  try {
    const matchedTimezone = moment.tz.names().find((timezone) => {
      const zoned = DateTime.now().setZone(timezone);
      return zoned.hour === 0;
    });

    const now = DateTime.now().setZone(matchedTimezone);
    console.log('update ranking', now.toISO());

    if (!matchedTimezone) {
      console.error('No timezone matched midnight. Aborting ranking update.');
      return;
    }

    const timezoneOffset = Math.floor(now.offset / 60);

    const rankingDate = now.minus({ day: 1 }).startOf('day');
    await insertRankings('day', rankingDate, timezoneOffset);

    if (now.weekday === 1) {
      const rankingDate = now.minus({ week: 1 }).startOf('week');
      await insertRankings('week', rankingDate, timezoneOffset);
    }

    if (now.day === 1) {
      const rankingDate = now.minus({ month: 1 }).startOf('month');
      await insertRankings('month', rankingDate, timezoneOffset);
    }
  } catch (err) {
    console.log(err);
  }
};

const insertRankings = async (
  viewer: Viewer,
  dateTime: DateTime,
  timezoneOffset: number,
) => {
  try {
    const date = dateTime.toSeconds();
    const ranking_id = nanoid(10);
    const rawRankings = await getCachedRanking({ viewer, timezoneOffset });

    const newRanking = await prisma.rankings.create({
      data: {
        ranking_id,
        date,
        timezone: timezoneOffset.toString(),
        mode: viewer,
        length: rawRankings.length,
      },
    });

    await prisma.ranking_details.createMany({
      data: rawRankings.map(({ user_id, rank, study_time }) => ({
        ranking_id,
        user_id,
        rank,
        study_time,
      })),
      skipDuplicates: true, // equivalent to INSERT IGNORE
    });

    console.log('created ranking', newRanking);

    delCacheRanking(viewer, timezoneOffset);
  } catch (err) {
    console.log(err);
  }
};
