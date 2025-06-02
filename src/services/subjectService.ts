import _ from 'lodash';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma/client';
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

export const subjectsFormatter = (
  rawSubjects: RawSubject[],
  timezone: string,
): { subjects: Subject[]; groupedSubjects: GroupedSubjects } => {
  try {
    if (!rawSubjects.length) return subjectsPlaceholder;

    rawSubjects.sort((a, b) => a.created_at - b.created_at);
    const dayStart = DateTime.fromSeconds(rawSubjects[0].created_at, {
      zone: timezone,
    }).startOf('day');
    const weekStart = dayStart.startOf('week');
    const monthStart = dayStart.startOf('month');

    const now = DateTime.now().setZone(timezone).startOf('day');

    const daysLength = now.diff(dayStart, 'days').days + 1;
    const weeksLength = now.startOf('week').diff(weekStart, 'weeks').weeks + 1;
    const monthsLength =
      now.startOf('month').diff(monthStart, 'months').months + 1;

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
      day: {
        timeline: _.cloneDeep(dayTimeline),
        total: _.cloneDeep(dayData),
        //focus: _.cloneDeep(dayData),
      },
      week: {
        timeline: _.cloneDeep(weekTimeline),
        total: _.cloneDeep(weekData),
        //focus: _.cloneDeep(weekData),
      },
      month: {
        timeline: _.cloneDeep(monthTimeline),
        total: _.cloneDeep(monthData),
        //focus: _.cloneDeep(monthData),
      },
    };

    const subjects: Subject[] = [];

    rawSubjects.forEach((rawSubject) => {
      // Initialize subject's timelines
      const subject: Subject = {
        ...rawSubject,
        day: {
          timeline: _.cloneDeep(dayTimeline),
          total: _.cloneDeep(dayData),
          //focus: _.cloneDeep(dayData),
        },
        week: {
          timeline: _.cloneDeep(weekTimeline),
          total: _.cloneDeep(weekData),
          //focus: _.cloneDeep(weekData),
        },
        month: {
          timeline: _.cloneDeep(monthTimeline),
          total: _.cloneDeep(monthData),
          //focus: _.cloneDeep(monthData),
        },
        timeline: rawSubject.subject_timelines.map((timeline) => [
          timeline.start_time,
          timeline.duration,
        ]),
      };

      subject.timeline.forEach(([start, duration]) => {
        const end = start + duration;
        const endDateTime = DateTime.fromSeconds(end, {
          zone: timezone,
        }).startOf('day');

        const dayIndex = endDateTime.diff(dayStart, 'day').days;
        if (dayIndex >= 0 && dayIndex < daysLength) {
          subject.day.timeline[dayIndex].data.push([start, end]);
          subject.day.total[dayIndex].data += duration;

          groupedSubjects.day.timeline[dayIndex].data.push([start, end]);
          groupedSubjects.day.total[dayIndex].data += duration;
        }

        const weekIndex = endDateTime
          .startOf('week')
          .diff(weekStart, 'week').weeks;
        if (weekIndex >= 0 && weekIndex < weeksLength) {
          subject.week.timeline[weekIndex].data.push([start, end]);
          subject.week.total[weekIndex].data += duration;

          groupedSubjects.week.timeline[weekIndex].data.push([start, end]);
          groupedSubjects.week.total[weekIndex].data += duration;
        }

        const monthIndex = endDateTime
          .startOf('month')
          .diff(monthStart, 'month').months;
        if (monthIndex >= 0 && monthIndex < monthsLength) {
          subject.month.timeline[monthIndex].data.push([start, end]);
          subject.month.total[monthIndex].data += duration;

          groupedSubjects.month.timeline[monthIndex].data.push([start, end]);
          groupedSubjects.month.total[monthIndex].data += duration;
        }
      });
      subjects.push(subject);
    });

    return { subjects, groupedSubjects };
  } catch (err) {
    console.log(err);
    return subjectsPlaceholder;
  }
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
