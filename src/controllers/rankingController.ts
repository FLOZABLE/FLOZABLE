import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

import prisma from '../libs/prisma';
import { getDates } from '../libs/utils';
import {
  getCachedRanking,
  getCachedUserRanking,
  getCachedUsers,
} from '../services/cacheService';
import {
  GetRankingQuery,
  GetUserRankingParams,
  GetUserRankingQuery,
  Ranking,
  RawRanking,
} from '../types/rankingTypes';

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
      rawRankings = await getCachedRanking({ viewer, timezoneOffset });
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

export const getUserRanking = async (
  req: Request<GetUserRankingParams, {}, {}, GetUserRankingQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.user_id;
    const { viewer, date, timezone } = req.query;

    const dates = getDates({ date, timezone, viewer, length: 7 });

    const dbUserRankings = await prisma.ranking_details.findMany({
      where: {
        user_id: userId,
        rankings: {
          mode: viewer,
          date: {
            in: dates.map((date) => date.toSeconds()),
          },
        },
      },
      select: {
        rank: true,
        rankings: {
          select: {
            date: true,
            length: true,
          },
        },
      },
    });

    const totalUsers = await prisma.users.count();

    const now = DateTime.now().setZone(timezone).startOf('day').startOf(viewer);

    const rankings = await Promise.all(
      dates.map(async (date) => {
        if (date.toSeconds() === now.toSeconds()) {
          const timezoneOffset = Math.floor(now.offset / 60);
          const currentRanking = await getCachedUserRanking({
            userId,
            viewer,
            timezoneOffset,
          });
          if (currentRanking) {
            return { date: date.toISO(), ranking: currentRanking };
          }
        }

        const rankingInfo = dbUserRankings.find(
          (ranking) => ranking.rankings.date === date.toSeconds(),
        );
        if (rankingInfo) {
          return { date: date.toISO(), ranking: rankingInfo.rank };
        }

        return { date: date.toISO(), ranking: totalUsers };
      }),
    );

    res.send({ data: { rankings } });
  } catch (error) {
    next(error);
  }
};
