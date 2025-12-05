import * as cookie from 'cookie';
import { nanoid } from 'nanoid';
import { Namespace } from 'socket.io';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { groupSelect } from '../queries/groupQueries';
import {
  cacheUserActiveGroup,
  delCachedUserActiveGroup,
  delCachedUserStatus,
  getCachedChatroomMembers,
  getCachedUser,
  getCachedUserFriends,
  getCachedUserGroups,
  getCachedUserNotificationTokens,
  getCachedUsersNotificationTokens,
  isChatroomMember,
  setUserChatroomStatus,
  updateChatroomUnreadStatus,
} from '../services/cacheService';
import { formatGroups } from '../services/groupService';
import { sendPushNotifications } from '../services/notificationService';
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
      let token: string = socket.handshake.query.token as string;

      //console.log(cookies, 'gd', token)

      if (cookies) {
        const parsedCookies = cookie.parse(cookies);
        if (!parsedCookies.token) return;
        token = parsedCookies.token;
      }

      if (!token) return;

      const userId = await getUserIdByToken(token);

      if (!userId) return;

      console.log('socket connected', userId);

      socket.join(userId);

      const device = socket.handshake.query?.device;
      if (device !== 'mobile' && device !== 'chrome-extension') {
        handleStudyStart(userId);
      }

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

          socket.join(groupId);

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

          const now = nowSec();

          await cacheUserActiveGroup({
            userId,
            groupId,
            time: now,
            name: group.name,
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('study:start', async (subject_id: string) => {
        console.log('start', userId, subject_id);
        const subject = await handleStudyStart(userId, subject_id);

        const notificationTokens = await getCachedUserNotificationTokens({
          userId,
        });

        console.log('start', notificationTokens);

        sendPushNotifications({
          pushTokens: notificationTokens,
          message: {
            to: '',
            data: {
              action: 'STUDY_START',
              subject,
            },
            _contentAvailable: true,

            // --- iOS TRIGGER ---
            apns: {
              payload: {
                aps: {
                  'content-available': 1, // <<< THIS IS THE iOS WAKE-UP FLAG
                },
              },
            },

            // --- Android Trigger ---
            priority: 'high',
          },
        });
      });

      socket.on('study:stop', async () => {
        handleStudyStop(userId);

        const notificationTokens = await getCachedUserNotificationTokens({
          userId,
        });

        console.log('stop', notificationTokens);

        sendPushNotifications({
          pushTokens: notificationTokens,
          message: {
            to: '',
            data: {
              action: 'STUDY_STOP',
            },
            _contentAvailable: true,

            // --- iOS TRIGGER ---
            apns: {
              payload: {
                aps: {
                  'content-available': 1, // <<< THIS IS THE iOS WAKE-UP FLAG
                },
              },
            },

            // --- Android Trigger ---
            priority: 'high',
          },
        });
      });

      socket.on('chat:send', async (roomId: string, message: string) => {
        try {
          if (!roomId || !message || message.length > 500) return;
          const userInfo = await getCachedUser({ userId });

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

          const userTokens = await getCachedUsersNotificationTokens(
            members.filter((member) => member !== userId),
          );

          console.log(
            'tokens',
            userTokens,
            userTokens.flatMap((token) => token.tokens),
          );

          const threadId = `chatGroup_${roomId}`;

          sendPushNotifications({
            pushTokens: userTokens.flatMap((userToken) => userToken.tokens),
            message: {
              to: '',
              title: `${userInfo?.name} sent a message`,
              body: message,
              sound: 'default',
              data: {
                chatroom_id: roomId,
                thread_id: threadId, // Also useful to keep in the data payload for app logic
              },
              richContent: {
                image:
                  'https://static.flozable.com/img/profile-images/1u1URcHXk2.jpeg',
              },
              categoryId: `chatActionCategory_${roomId}`,

              apns: {
                payload: {
                  aps: {
                    // This is the native iOS key used to group notifications.
                    // All notifications with the same 'thread-id' will be grouped.
                    'thread-id': threadId,
                  },
                },
              },
            },
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

          const notificationTokens = await getCachedUserNotificationTokens({
            userId,
          });

          console.log('stop', notificationTokens);

          sendPushNotifications({
            pushTokens: notificationTokens,
            message: {
              to: '',
              data: {
                action: 'STUDY_STOP',
              },
              _contentAvailable: true,

              // --- iOS TRIGGER ---
              apns: {
                payload: {
                  aps: {
                    'content-available': 1, // <<< THIS IS THE iOS WAKE-UP FLAG
                  },
                },
              },

              // --- Android Trigger ---
              priority: 'high',
            },
          });
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
