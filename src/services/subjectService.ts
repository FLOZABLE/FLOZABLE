import { Prisma } from '../generated/prisma';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import {
  GroupedSubjects,
  Subject,
  TimelineEntry,
  TotalEntry,
} from '../types/subjectTypes';

type CreateSubjectParams = Omit<
  Prisma.subjectsCreateInput,
  'subject_id' | 'created_at'
>;

export const createSubject = async (params: CreateSubjectParams) => {
  const created_at = nowSec();
  const subject_id = nanoid(10);

  const newSubject = await prisma.subjects.create({
    data: {
      subject_id,
      created_at,
      ...params,
    },
  });

  return newSubject;
};

const subjectsPlaceholder = {
  subjects: [],
  groupedSubjects: {
    day: { timeline: [], total: [] },
    week: { timeline: [], total: [] },
    month: { timeline: [], total: [] },
  },
};

type RawSubject = Prisma.subjectsGetPayload<{
  select: {
    subject_id: true;
    name: true;
    color: true;
    created_at: true;
    subject_timelines: {
      select: {
        start_time: true;
        duration: true;
      };
    };
  };
}>;

export const getSubjects = async (userId: string, timezone: string) => {
  try {
    const subjects = await prisma.subjects.findMany({
      select: {
        subject_id: true,
        name: true,
        color: true,
        created_at: true,
        subject_timelines: {
          select: {
            start_time: true,
            duration: true,
          },
        },
      },
      where: {
        user_id: userId,
      },
    });

    const formattedSubjects = subjectsFormatter(subjects, timezone);
    return formattedSubjects;
  } catch (err) {
    console.log(err);
    return subjectsPlaceholder;
  }
};

export const subjectsFormatter = (
  rawSubjects: RawSubject[],
  timezone: string,
): { subjects: Subject[]; groupedSubjects: GroupedSubjects } => {
  if (!rawSubjects.length) return subjectsPlaceholder;

  rawSubjects.sort((a, b) => a.created_at - b.created_at);
  const dayStart = DateTime.fromSeconds(rawSubjects[0].created_at, {
    zone: timezone,
  }).startOf('day');
  const weekStart = dayStart.startOf('week');
  const monthStart = dayStart.startOf('month');

  const now = DateTime.now().setZone(timezone).startOf('day');

  const daysLength = Math.max(0, now.diff(dayStart, 'days').days + 1);
  const weeksLength = Math.max(
    0,
    now.startOf('week').diff(weekStart, 'weeks').weeks + 1,
  );
  const monthsLength = Math.max(
    0,
    now.startOf('month').diff(monthStart, 'months').months + 1,
  );

  const { dataArray: dayData, timelineArray: dayTimeline } = arrayGenerator(
    daysLength,
    dayStart,
    'day',
  );
  const { dataArray: weekData, timelineArray: weekTimeline } = arrayGenerator(
    weeksLength,
    weekStart,
    'week',
  );
  const { dataArray: monthData, timelineArray: monthTimeline } =
    arrayGenerator(monthsLength, monthStart, 'month');

  const groupedSubjects: GroupedSubjects = {
    day: { timeline: dayTimeline, total: dayData },
    week: { timeline: weekTimeline, total: weekData },
    month: { timeline: monthTimeline, total: monthData },
  };

  const subjectsMap = new Map<string, Subject>();

  for (const rawSubject of rawSubjects) {
    const subject: Subject = {
      ...rawSubject,
      day: {
        timeline: dayTimeline.map((t) => ({ ...t, data: [] })),
        total: dayData.map((d) => ({ ...d, data: 0 })),
      },
      week: {
        timeline: weekTimeline.map((t) => ({ ...t, data: [] })),
        total: weekData.map((d) => ({ ...d, data: 0 })),
      },
      month: {
        timeline: monthTimeline.map((t) => ({ ...t, data: [] })),
        total: monthData.map((d) => ({ ...d, data: 0 })),
      },
      timeline: rawSubject.subject_timelines.map((timeline) => [
        timeline.start_time,
        timeline.duration,
      ]),
    };
    subjectsMap.set(rawSubject.subject_id, subject);

    for (const [start, duration] of subject.timeline) {
      const end = start + duration;
      const endDateTime = DateTime.fromSeconds(end, { zone: timezone });

      const dayIndex = Math.floor(endDateTime.diff(dayStart, 'days').days);
      if (dayIndex >= 0 && dayIndex < daysLength) {
        subject.day.timeline[dayIndex].data.push([start, end]);
        subject.day.total[dayIndex].data += duration;
        groupedSubjects.day.timeline[dayIndex].data.push([start, end]);
        groupedSubjects.day.total[dayIndex].data += duration;
      }

      const weekIndex = Math.floor(
        endDateTime.startOf('week').diff(weekStart, 'weeks').weeks,
      );
      if (weekIndex >= 0 && weekIndex < weeksLength) {
        subject.week.timeline[weekIndex].data.push([start, end]);
        subject.week.total[weekIndex].data += duration;
        groupedSubjects.week.timeline[weekIndex].data.push([start, end]);
        groupedSubjects.week.total[weekIndex].data += duration;
      }

      const monthIndex = Math.floor(
        endDateTime.startOf('month').diff(monthStart, 'months').months,
      );
      if (monthIndex >= 0 && monthIndex < monthsLength) {
        subject.month.timeline[monthIndex].data.push([start, end]);
        subject.month.total[monthIndex].data += duration;
        groupedSubjects.month.timeline[monthIndex].data.push([start, end]);
        groupedSubjects.month.total[monthIndex].data += duration;
      }
    }
  }

  return { subjects: Array.from(subjectsMap.values()), groupedSubjects };
};

function arrayGenerator(
  length: number,
  date: DateTime,
  mode: 'day' | 'week' | 'month',
) {
  try {
    const dataArray: TotalEntry[] = Array.from({ length }, (_, i) => {
      return { date: date.plus({ [mode]: i }).toISODate()!, data: 0 };
    });

    const timelineArray: TimelineEntry[] = dataArray.map((day) => ({
      ...day,
      data: [],
    }));
    return { dataArray, timelineArray };
  } catch (err) {
    console.log(err);
    return { dataArray: [], timelineArray: [] };
  }
}
