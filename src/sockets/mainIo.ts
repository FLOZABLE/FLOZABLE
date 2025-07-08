import * as cookie from 'cookie';
import { Namespace } from 'socket.io';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import {
  cacheRanking,
  cacheUserStatus,
  delCachedUserStatus,
  getCachedUserFriends,
  getCachedUserGroups,
  getCachedUserStatus,
} from '../services/cacheService';
import { getUserIdByToken } from '../services/sessionService';
import { handleStudyStart, handleStudyStop } from '../services/studyService';
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

      handleStudyStart(userId);

      socket.on('study:start', async (subject_id: string) => {
        handleStudyStart(userId, subject_id);
      });

      socket.on('study:stop', async () => {
        handleStudyStop(userId);
      });

      socket.on('disconnect', async (reason) => {
        try {
          const device = socket.handshake.query?.device;
          console.log('disconnection', device);

          //won't terminate if it's mobile or chrome extension
          if (device === 'mobile' || device === 'chrome-extension') return;

          await delCachedUserStatus(userId);

          handleStudyStop(userId, true);
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
