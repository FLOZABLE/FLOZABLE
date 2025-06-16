import { NextFunction, Request, Response } from 'express';

import { Prisma } from '../generated/prisma';
import prisma from '../libs/prisma';
import { createSubject, subjectsFormatter } from '../services/subjectService';
import { GetSubjectAllQuery, PutSubjectBody } from '../types/subjectTypes';

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

export const putSubject = async (
  req: Request<{}, {}, PutSubjectBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user_id = req.user_id!;
    const { name, color } = req.body;

    const subject = await createSubject({
      name,
      color,
      users: {
        connect: { user_id },
      },
    });

    res.send({ success: true, data: { subject } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        message: 'You already have subject with this name.',
      });
      return;
    }

    next(error);
  }
};
