import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';

export const getChatRoomAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const rawChatrooms = await prisma.chatrooms.findMany({
      where: {
        OR: [
          {
            members: { some: { user_id: userId } },
          },
          {
            group: {
              group_members: { some: { user_id: userId } },
            },
          },
        ],
      },
      select: {
        chatroom_id: true,
        name: true,
        type: true,
        group: {
          select: {
            group_id: true,
            name: true,
          },
        },
        members: {
          select: {
            user_id: true,
          },
        },
      },
    });

    const chatrooms = rawChatrooms.map((c) => ({
      chatroom_id: c.chatroom_id,
      type: c.type,
      name: c.group?.name || c.name, // use group name if exists, fallback to chatroom name
      members: c.members.map((m) => m.user_id).join(','),
    }));

    console.log(chatrooms);

    res.send({ success: true, data: { chatrooms } });
  } catch (error) {
    next(error);
  }
};
