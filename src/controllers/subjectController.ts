import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { subjectsFormatter } from '../services/subjectService';
import { GetSubjectAllQuery } from '../types/subjectTypes';

export const getSubjectAll = async (
  req: Request<{}, {}, {}, GetSubjectAllQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { timezone } = req.query;
    const userId = req.user_id!;
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
    res.send({
      data: {
        subjects: formattedSubjects.subjects,
        grouped_subjects: formattedSubjects.groupedSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
