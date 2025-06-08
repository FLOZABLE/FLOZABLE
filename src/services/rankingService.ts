import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

export const updateRanking = async () => {
  try {
    let now: DateTime<true | false> = DateTime.now();
    const allTimezones = Intl.supportedValuesOf('timeZone');

    allTimezones.findIndex((timezone) => {
      now = now.setZone(timezone);
      return now.get('hour') === 0;
    });

    console.log('update ranking', now.toISO());

    const timezoneOffset = Math.floor(now.offset / 60);

    const rankingDate = now.minus({ day: 1 }).startOf('day');
    await updateDailyRanking(rankingDate, timezoneOffset);

    if (now.weekday === 1) {
      const rankingDate = now.minus({ week: 1 }).startOf('week');
      await updateWeeklyRanking(rankingDate, timezoneOffset);
    }

    if (now.day === 1) {
      const rankingDate = now.minus({ month: 1 }).startOf('month');
      await updateMonthlyRanking(rankingDate, timezoneOffset);
    }
  } catch (err) {
    console.log(err);
  }
};

const updateDailyRanking = async (
  dateTime: DateTime,
  timezoneOffset: number,
) => {
  try {
    const ranking_id = nanoid(10);
  } catch (err) {
    console.log(err);
  }
};

const updateWeeklyRanking = async (
  dateTime: DateTime,
  timezoneOffset: number,
) => {};

const updateMonthlyRanking = async (
  dateTime: DateTime,
  timezoneOffset: number,
) => {};
