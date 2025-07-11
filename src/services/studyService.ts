import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getMainIo } from '../sockets/mainIo';
import {
  cacheRanking,
  cacheUserStatus,
  getCachedUserFriends,
  getCachedUserGroups,
  getCachedUserStatus,
} from './cacheService';

export const handleStudyStart = async (userId: string, subjectId?: string) => {
  try {
    const now = nowSec();

    const [groups, friends] = await Promise.all([
      getCachedUserGroups({ userId }),
      getCachedUserFriends({ userId }),
    ]);

    let subject:
      | { name: string; subject_id: string; start_time: number }
      | undefined;

    if (subjectId) {
      const subjectData = await prisma.subjects.findFirst({
        select: { name: true },
        where: { subject_id: subjectId, user_id: userId },
      });
      if (!subjectData) return;

      subject = { ...subjectData, subject_id: subjectId, start_time: now };
      await cacheUserStatus({
        userId,
        subjectId,
        name: subjectData.name,
        startTime: now,
      });
    } else {
      const newStatus = await cacheUserStatus({ userId, startTime: now });
      subject = {
        ...newStatus,
        subject_id: newStatus.subject_id,
        start_time: now,
      };
    }

    const mainIo = getMainIo();

    mainIo?.to([...friends, ...groups, userId]).emit('study:start', {
      user_id: userId,
      subject: { ...subject, start_time: now },
    });

    mainIo?.to(userId).emit('mystudy:start', {
      subject: { ...subject, start_time: now },
    });

    cacheUserStatus({
      userId,
      subjectId,
      name: subject.name,
      startTime: now,
    });
  } catch (err) {
    console.log(err);
  }
};

export const handleStudyStop = async (
  userId: string,
  isDisconnection: boolean = false,
) => {
  try {
    const now = nowSec();

    const [status, groups, friends] = await Promise.all([
      getCachedUserStatus(userId),
      getCachedUserGroups({ userId }),
      getCachedUserFriends({ userId }),
    ]);

    const duration = status ? now - status.start_time : 0;

    const mainIo = getMainIo();

    if (isDisconnection) {
      mainIo?.to([...friends, ...groups, userId]).emit('study:stop', {
        user_id: userId,
        status: null,
        duration,
      });
      
      mainIo?.to(friends).emit('group:member:offline', { user_id: userId });
    } else {
      const newStatus = await cacheUserStatus({ userId, startTime: now });

      mainIo?.to([...friends, ...groups, userId]).emit('study:stop', {
        user_id: userId,
        status: newStatus,
        duration,
      });
    }

    if (status) {
      mainIo?.to(userId).emit('mystudy:stop', {
        stopped_subject_id: status.subject_id,
        duration,
      });

      if (duration && status.subject_id !== '0') {
        await prisma.subject_timelines.create({
          data: {
            subject_id: status.subject_id,
            start_time: status.start_time,
            duration,
          },
        });

        for (let i = -12; i < 12; i++) {
          cacheRanking(userId, 'day', i, duration);
          cacheRanking(userId, 'week', i, duration);
          cacheRanking(userId, 'month', i, duration);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
