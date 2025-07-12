import { DateTime } from 'luxon';
import { scheduleJob } from 'node-schedule';

import { BOT_OPTIONS } from '../libs/constants';
import prisma from '../libs/prisma';
import { randomIntInRange } from '../libs/utils';
import redisClient from '../models/redisClient';
import { delCachedUserStatus } from './cacheService';
import { handleStudyStart, handleStudyStop } from './studyService';

export const botsSelector = async (numbers: number) => {
  try {
    const bots = await prisma.users.findMany({
      where: {
        type: -1,
      },
      select: {
        user_id: true,
        subjects: {
          take: 1,
          select: {
            subject_id: true,
          },
        },
      },
    });

    const now = DateTime.now();

    const activeBots = await redisClient.smembers('activebots');

    for (let i = 0; i < numbers; i++) {
      const index = randomIntInRange(0, bots.length - 1);
      if (!bots[index]) continue;

      // Prevents the same bot from being added
      if (activeBots.includes(bots[index].user_id)) continue;
      activeBots.push(bots[index].user_id);

      const bot = bots[index];

      const duration = randomIntInRange(
        BOT_OPTIONS.MIN_STUDY,
        BOT_OPTIONS.MAX_STUDY,
      );

      const start =
        randomIntInRange(
          BOT_OPTIONS.MIN_START_DELAY,
          BOT_OPTIONS.MAX_START_DELAY,
        ) + now.toSeconds();

      const startDate = DateTime.fromSeconds(start);
      const stopDate = DateTime.fromSeconds(startDate.toSeconds() + duration);

      console.log(startDate.toISO());

      // Schedule bot start and stop jobs
      scheduleJob(startDate.toJSDate(), () =>
        botStartStudy(bot.user_id, bot.subjects),
      );
      scheduleJob(stopDate.toJSDate(), () => botStopStudy(bot.user_id));

      bots.splice(index, 1);
    }

    console.log(`scheduled ${activeBots.length} bots`, numbers);

    // Update active bot list in Redis if there are new active bots
    if (activeBots.length) {
      redisClient.sadd('activebots', activeBots);
    }
  } catch (err) {
    console.log(err);
  }
};

const botStartStudy = async (
  userId: string,
  subjects: { subject_id: string }[],
) => {
  try {
    if (!subjects.length) {
      console.log(`bot - ${userId}: no subject`);
      return;
    }
    const subject = subjects[randomIntInRange(0, subjects.length - 1)];
    console.log(`bot - ${userId}: study start`);
    handleStudyStart(userId, subject.subject_id);
  } catch (err) {
    console.log(err);
  }
};

const botStopStudy = async (userId: string) => {
  try {
    console.log(`bot - ${userId}: study stop`);

    await handleStudyStop(userId, true);

    await delCachedUserStatus(userId);
  } catch (err) {
    console.log(err);
  }
};

export const stopAllBots = async () => {
  const activeBots = await redisClient.smembers('activebots');
  await Promise.all(
    activeBots.map(async (botId) => {
      await botStopStudy(botId);
    }),
  );

  redisClient.del('activebots');
};
