import { createInterface } from 'readline';
import { nanoid } from 'nanoid';
import pMap from 'p-map';

import prisma from '../libs/prisma';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(
  `
  SELECT OPTION:
  1: Update chatrooms
  Your choice: `,
  async (rawOption) => {
    const option = parseInt(rawOption.trim());
    if (option === 1) {
      await updateChatrooms();
    } else {
      console.log('Invalid option selected.');
    }

    readline.close();
    process.exit(0);
  },
);

const updateChatrooms = async () => {
  try {
    console.log('Fetching chatrooms...');
    const chatrooms = await prisma.chatrooms.findMany({
      select: { members: true, chatroom_id: true },
    });

    const possibleGroupChatrooms: string[] = chatrooms
      .filter((chatroom) => chatroom.members.length === 0)
      .map((chatroom) => chatroom.chatroom_id);

    if (!possibleGroupChatrooms.length) {
      console.log('No group chatrooms found needing update.');
      return;
    }

    console.log(
      `Possible group chatrooms to update: ${possibleGroupChatrooms.join(', ')}`,
    );

    const groups = await prisma.groups.findMany({
      where: {
        group_id: { in: possibleGroupChatrooms },
      },
    });

    if (!groups.length) {
      console.log('No matching groups found for these chatrooms.');
      return;
    }

    console.log(`Found ${groups.length} groups to update.`);

    await pMap(
      groups,
      async (group) => {
        const newChatroomId = nanoid(10);

        await prisma.chatrooms.update({
          data: {
            chatroom_id: newChatroomId,
            group_id: group.group_id,
            type: 'group',
          },
          where: {
            chatroom_id: group.group_id,
          },
        });

        console.log(
          `Updated chatroom for group: ${group.name} (new chatroom_id: ${newChatroomId})`,
        );
      },
      { concurrency: 1 }, // Safely update up to 10 chatrooms in parallel
    );

    console.log('🎉 All updates complete!');
  } catch (err) {
    console.error('❌ Error updating chatrooms:', err);
  }
};
