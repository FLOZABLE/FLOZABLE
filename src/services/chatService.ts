import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { UserInfo } from '../types/accountTypes';

export const createChatroom = async (users: UserInfo[]) => {
  if (users.length !== 2) return;

  const chatroom_id = nanoid(10);
  const name = `${users[0].name}, ${users[1].name}`;

  try {
    await prisma.$transaction([
      prisma.chatrooms.create({
        data: {
          chatroom_id,
          name,
          type: 'room',
        },
      }),
      prisma.chatroom_members.createMany({
        data: users.map((u) => ({
          chatroom_id,
          user_id: u.user_id,
        })),
      }),
    ]);
  } catch (error) {
    console.error('Failed to create chatroom:', error);
  }
};
