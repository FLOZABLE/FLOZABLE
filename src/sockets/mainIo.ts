import * as cookie from 'cookie';
import { nanoid } from 'nanoid';
import { Namespace } from 'socket.io';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  delCachedUserActiveGroup,
  delCachedUserStatus,
  getCachedChatroomMembers,
  getCachedUserFriends,
  getCachedUserGroups,
  isChatroomMember,
  setUserChatroomStatus,
  updateChatroomUnreadStatus,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
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

      //join socket for chatrooms
      const chatrooms = await prisma.chatrooms.findMany({
        where: {
          OR: [
            {
              members: {
                some: {
                  user_id: userId,
                },
              },
            },
            {
              group: {
                group_members: {
                  some: {
                    user_id: userId,
                  },
                },
              },
            },
          ],
        },
        select: {
          chatroom_id: true,
        },
      });

      const chatSocketIds = chatrooms.map(
        (chatroom) => 'chatroom:' + chatroom.chatroom_id,
      );

      socket.join(chatSocketIds);

      socket.on('group:change', async (groupId: string | null) => {
        try {
          const [groups, friends] = await Promise.all([
            getCachedUserGroups({ userId }),
            getCachedUserFriends({ userId }),
          ]);

          if (groupId === null) {
            groups.map((group) => {
              socket.leave(group);
            });
            delCachedUserActiveGroup(userId);
            if (friends.length) {
              mainIo
                ?.to(friends)
                .emit('group:member:offline', { user_id: userId });
            }
            return;
          }

          if (!friends.length) return;

          const rawGroup = await prisma.groups.findFirst({
            where: {
              group_id: groupId,
              group_members: { some: { user_id: userId } },
            },
            select: groupSelect,
          });

          if (!rawGroup) return;

          const [group] = formatGroups([rawGroup]);

          mainIo
            ?.to(friends)
            .emit('group:member:online', { user_id: userId, group });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('study:start', async (subject_id: string) => {
        handleStudyStart(userId, subject_id);
      });

      socket.on('study:stop', async () => {
        handleStudyStop(userId);
      });

      socket.on('chat:send', async (roomId: string, message: string) => {
        try {
          if (!roomId || !message || message.length > 500) return;

          const members = await getCachedChatroomMembers(roomId);
          if (!members.includes(userId)) return;

          const sent_at = nowSec();
          const message_id = nanoid(10);

          const newMessage = await prisma.chatroom_messages.create({
            data: {
              chatroom_id: roomId,
              message,
              user_id: userId,
              message_id,
              sent_at,
            },
          });

          mainIo?.to(`chatroom:${roomId}`).emit('chat:message', {
            message: newMessage,
            chatroom_id: roomId,
          });

          await updateChatroomUnreadStatus({
            roomId,
            messageId: message_id,
            senderId: userId,
            allMemberIds: members,
          });
        } catch (err) {
          console.error('chat:send error:', err);
        }
      });

      socket.on('chat:read', async (roomId) => {
        try {
          if (!userId || !roomId) return;

          const isMember = await isChatroomMember(userId, roomId);

          if (!isMember) return;

          const lastMessage = await prisma.chatroom_messages.findFirst({
            where: {
              chatroom_id: roomId,
            },
            orderBy: {
              sent_at: 'desc',
            },
            take: 1,
            select: {
              message_id: true,
              message: true,
              sent_at: true,
              user_id: true,
            },
          });

          setUserChatroomStatus({
            userId,
            roomId,
            messageId: lastMessage?.message_id,
            unreads: 0,
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('disconnect', async () => {
        try {
          const device = socket.handshake.query?.device;
          console.log('disconnection', device);

          //won't terminate if it's mobile or chrome extension
          if (device === 'mobile' || device === 'chrome-extension') return;

          await handleStudyStop(userId, true);

          await delCachedUserStatus(userId);
          await delCachedUserActiveGroup(userId);
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
