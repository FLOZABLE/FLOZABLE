import { NextFunction, Request, Response } from 'express';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { ChatroomIdParams } from '../types/chatTypes';

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
            group_members: {
              select: {
                user_id: true,
              },
            },
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
      members:
        c.type === 'group'
          ? c.group?.group_members.map((member) => member.user_id)
          : c.members,
    }));

    res.send({ success: true, data: { chatrooms } });
  } catch (error) {
    next(error);
  }
};

export const getChatRoomMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    res.send({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getChatRoomMembers = async (
  req: Request<ChatroomIdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const chatroomId = req.params.chatroom_id;

    const chatroom = await prisma.chatrooms.findUnique({
      where: { chatroom_id: chatroomId },
      select: { type: true, group_id: true },
    });

    if (!chatroom) {
      const error = AppErrorFactory.chatroomNotFound();
      res.status(error.status).send(error);
      return;
    }

    if (chatroom.type === 'group') {
      if (!chatroom.group_id) {
        const error = AppErrorFactory.unknownServerError();
        res.status(error.status).send(error);
        return;
      }

      const groupMembers = await prisma.group_members.findMany({
        where: { group_id: chatroom.group_id },
        select: {
          user: {
            select: { user_id: true, name: true },
          },
        },
      });

      const members = groupMembers.map((m) => m.user);
      res.send({ success: true, data: { members } });
      return;
    }

    // Default to 'room' chatroom type
    const roomMembers = await prisma.chatroom_members.findMany({
      where: { chatroom_id: chatroomId },
      select: {
        user: {
          select: { user_id: true, name: true },
        },
      },
    });

    const members = roomMembers.map((m) => m.user);
    res.send({ success: true, data: { members } });
  } catch (error) {
    next(error);
  }
};
