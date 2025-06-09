import * as cookie from 'cookie';
import { Namespace } from 'socket.io';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import {
  cacheRanking,
  cacheUserStatus,
  getCachedUserFriends,
  getCachedUserGroups,
  getCachedUserStatus,
} from '../services/cacheService';
import { getUserIdByToken } from '../services/sessionService';
import { getIO } from './io';

let mainIo: Namespace | null = null;

export const registerMainIoEvents = () => {
  const io = getIO();
  if (!io) {
    console.error('Socket.io server is not initialized yet!');
    return;
  }

  mainIo = io.of('/');

  mainIo.on('connection', async (socket) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return;
      const parsedCookies = cookie.parse(cookies);
      if (!parsedCookies.token) return;
      const userId = await getUserIdByToken(parsedCookies.token);
      if (!userId) return;

      console.log('socket connected', userId);

      socket.join(userId);

      socket.on('study:start', async (subject_id: string) => {
        const now = nowSec();

        const [subject, groups, friends] = await Promise.all([
          prisma.subjects.findFirst({
            select: { name: true },
            where: {
              subject_id: subject_id,
              user_id: userId,
            },
          }),
          getCachedUserGroups({ userId }),
          getCachedUserFriends({ userId }),
        ]);

        if (!subject) return;

        mainIo?.to([...friends, ...groups, userId]).emit('study:start', {
          user_id: userId,
          subject: { ...subject, subject_id, start_time: now },
        });

        mainIo?.to(userId).emit('mystudy:start', {
          subject: { ...subject, subject_id, start_time: now },
        });

        cacheUserStatus({
          userId,
          subjectId: subject_id,
          name: subject.name,
          startTime: now,
        });
      });

      socket.on('study:stop', async () => {
        try {
          const now = nowSec();

          const [status, groups, friends] = await Promise.all([
            getCachedUserStatus(userId),
            getCachedUserGroups({ userId }),
            getCachedUserFriends({ userId }),
          ]);

          console.log('stop', status);

          if (!status || status.subject_id === '0') return;

          const duration = now - status.start_time;

          mainIo?.to(userId).emit('mystudy:stop', {
            stopped_subject_id: status.subject_id,
            duration,
          });
          mainIo?.to([...friends, ...groups, userId]).emit('study:stop', {
            user_id: userId,
            status,
            duration,
          });

          cacheUserStatus({ userId, startTime: now });

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
        } catch (err) {
          console.log(err);
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
};

export const getMainIo = () => mainIo;
