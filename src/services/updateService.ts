import { createInterface } from 'readline';

import prisma from '../libs/prisma';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(
  `
  SELECT Option
  1: update chatrooms
  `,
  async (rawOption) => {
    const option = parseInt(rawOption);
    if (option === 1) {
      updateChatrooms();
    }
  },
);

const updateChatrooms = async () => {
  try {
    const chatrooms = await prisma.chatrooms.findMany({
      select: {
        members: true,
        chatroom_id: true,
      },
    });
    const groupChatrooms: string[] = [];
    chatrooms.map((chatroom) => {
      console.log(chatroom.members);
      if (!chatroom.members.length) {
        //possibly group
        groupChatrooms.push(chatroom.chatroom_id);
      }
    });

    const groups = await prisma.groups.findMany({
      where: {
        group_id: { in: groupChatrooms },
      },
    });

    groups.map((group) => {
      prisma.chatrooms.update({
        data: {
          group_id: group.group_id,
          type: 'group',
        },
        where: {
          chatroom_id: group.group_id,
        },
      });
    });

    console.log(groups);
  } catch (err) {
    console.log(err);
  }
};
