import { DateTime } from 'luxon';
import moment from 'moment-timezone';
import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { Viewer } from '../types/otherTypes';
import { delCacheRanking, getCachedRanking } from './cacheService';

export const updateRanking = async () => {
  try {
    let now: DateTime<true | false> = DateTime.now();
    const allTimezones = moment.tz.names();

    allTimezones.findIndex((timezone) => {
      now = now.setZone(timezone);
      return now.get('hour') === 0;
    });

    console.log('update ranking', now.toISO());

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
    const rawRankings = await getCachedRanking(viewer, timezoneOffset);

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
