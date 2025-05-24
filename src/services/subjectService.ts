import prisma from '../libs/prisma';
import { Prisma } from '../generated/prisma/client';
import { nowSec } from '../libs/utils';
import { nanoid } from 'nanoid';

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
