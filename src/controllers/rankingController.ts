import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

import prisma from '../libs/prisma';
import { getCachedRanking, getCachedUsers } from '../services/cacheService';
import { GetRankingQuery, Ranking, RawRanking } from '../types/rankingTypes';

export const getRanking = async (
  req: Request<{}, {}, {}, GetRankingQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { viewer, date, timezone } = req.query;

    const dateTime = DateTime.fromISO(date, { zone: timezone })
      .startOf('day')
      .startOf(viewer);

    const now = DateTime.now().setZone(timezone).startOf('day').startOf(viewer);

    let rawRankings: RawRanking[] = [];
    if (now.toSeconds() === dateTime.toSeconds()) {
      //today/this week/this month = cached
      const timezoneOffset = Math.floor(now.offset / 60);
      rawRankings = await getCachedRanking(viewer, timezoneOffset);
    } else {
      const rankingsData = await prisma.ranking_details.findMany({
        where: {
          rankings: {
            date: dateTime.toSeconds(),
            mode: viewer,
          },
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

    res.send({ data: { rankings } });
  } catch (error) {
    next(error);
  }
};
