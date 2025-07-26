import { DateTime } from 'luxon';
import { scheduleJob } from 'node-schedule';

import { BOT_OPTIONS } from '../libs/constants';
import prisma from '../libs/prisma';
import { randomIntInRange } from '../libs/utils';
import redisClient from '../models/redisClient';
import { delCachedUserStatus } from './cacheService';
import { handleStudyStart, handleStudyStop } from './studyService';

const REDIS_ACTIVE_BOTS_KEY = 'activebots';

export const botsSelector = async (count: number) => {
  try {
    const bots = await prisma.users.findMany({
      where: { type: -1 },
      select: {
        user_id: true,
        subjects: {
          take: 1,
          select: { subject_id: true },
        },
      },
    });

    if (!bots.length || count <= 0) return;

    const now = DateTime.now().toSeconds();
    const activeBots = new Set(
      await redisClient.smembers(REDIS_ACTIVE_BOTS_KEY),
    );
    const selected = new Set<string>();

    while (selected.size < count && selected.size < bots.length) {
      const index = randomIntInRange(0, bots.length - 1);
      const bot = bots[index];

      if (!bot || activeBots.has(bot.user_id) || selected.has(bot.user_id))
        continue;

      selected.add(bot.user_id);

      const startOffset = randomIntInRange(
        BOT_OPTIONS.MIN_START_DELAY,
        BOT_OPTIONS.MAX_START_DELAY,
      );
      const duration = randomIntInRange(
        BOT_OPTIONS.MIN_STUDY,
        BOT_OPTIONS.MAX_STUDY,
      );

      const startDate = DateTime.fromSeconds(now + startOffset);
      const stopDate = startDate.plus({ seconds: duration });

      console.log(
        `Scheduling bot ${bot.user_id} from ${startDate.toISO()} to ${stopDate.toISO()}`,
      );

      scheduleJob(startDate.toJSDate(), () =>
        botStartStudy(bot.user_id, bot.subjects),
      );
      scheduleJob(stopDate.toJSDate(), () => botStopStudy(bot.user_id));
    }

    if (selected.size > 0) {
      await redisClient.sadd(REDIS_ACTIVE_BOTS_KEY, ...Array.from(selected));
    }

    console.log(`Scheduled ${selected.size} bot(s). Requested: ${count}`);
  } catch (err) {
    console.error('Failed to schedule bots:', err);
  }
};

const botStartStudy = async (
  userId: string,
  subjects: { subject_id: string }[],
) => {
  try {
    if (!subjects.length) return console.log(`Bot ${userId} has no subjects.`);

    const subject = subjects[randomIntInRange(0, subjects.length - 1)];
    console.log(`Bot ${userId} starts studying ${subject.subject_id}`);
    await handleStudyStart(userId, subject.subject_id);
  } catch (err) {
    console.error(`Failed to start study for bot ${userId}:`, err);
  }
};

const botStopStudy = async (userId: string) => {
  try {
    console.log(`Bot ${userId} stops studying.`);
    await handleStudyStop(userId, true);
    await delCachedUserStatus(userId);
  } catch (err) {
    console.error(`Failed to stop study for bot ${userId}:`, err);
  }
};

export const stopAllBots = async () => {
  try {
    const activeBots = await redisClient.smembers(REDIS_ACTIVE_BOTS_KEY);

    await Promise.all(activeBots.map((botId) => botStopStudy(botId)));

    await redisClient.del(REDIS_ACTIVE_BOTS_KEY);
    console.log('Stopped all bots.');
  } catch (err) {
    console.error('Error stopping all bots:', err);
  }
};
