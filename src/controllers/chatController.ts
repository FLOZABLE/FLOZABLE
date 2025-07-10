import { NextFunction, Request, Response } from 'express';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { getCachedUserChatStatus } from '../services/cacheService';
import { ChatroomIdParams, GetChatRoomMessagesQuery } from '../types/chatTypes';

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
        messages: {
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
        },
      },
    });

    const chatStatus = await getCachedUserChatStatus(userId);

    const chatrooms = rawChatrooms.map((c) => ({
      chatroom_id: c.chatroom_id,
      type: c.type,
      name: c.group?.name || c.name, // use group name if exists, fallback to chatroom name
      members:
        c.type === 'group'
          ? c.group?.group_members.map((member) => member.user_id)
          : c.members,
      last_message: c.messages?.[0] || null,
      last_read: chatStatus[c.chatroom_id]?.last_read_message_id || null,
      unreads: chatStatus[c.chatroom_id]?.unreads || 0,
    }));

    chatrooms.sort((a, b) => {
      if (!a.last_message && !b.last_message) return 0; // Both are null
      if (!a.last_message) return 1; // a is null, should go to the end
      if (!b.last_message) return -1; // b is null, should go to the end
      return b.last_message.sent_at - a.last_message.sent_at; // Both have a last_message, compare normally
    });

    res.send({ success: true, data: { chatrooms } });
  } catch (error) {
    next(error);
  }
};

export const getChatRoomMessages = async (
  req: Request<ChatroomIdParams, {}, {}, GetChatRoomMessagesQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const chatroomId = req.params.chatroom_id;
    const offset = parseInt(req.query.offset);
    const length = parseInt(req.query.length);

    const chatroom = await prisma.chatrooms.findFirst({
      where: {
        chatroom_id: chatroomId,
        OR: [
          { members: { some: { user_id: userId } } },
          { group: { group_members: { some: { user_id: userId } } } },
        ],
      },
      select: { chatroom_id: true },
    });

    if (!chatroom) {
      const error = AppErrorFactory.chatroomAccessDenied();
      res.status(error.status).send(error);
      return;
    }

    const messages = await prisma.chatroom_messages.findMany({
      where: {
        chatroom_id: chatroomId,
      },
      orderBy: {
        sent_at: 'desc',
      },
      skip: offset,
      take: length,
      select: {
        message_id: true,
        user_id: true,
        message: true,
        sent_at: true,
      },
    });

    res.send({ success: true, data: { messages } });
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

    const chatroom = await prisma.chatrooms.findFirst({
      where: {
        chatroom_id: chatroomId,
        OR: [
          { members: { some: { user_id: userId } } },
          { group: { group_members: { some: { user_id: userId } } } },
        ],
      },
      select: {
        type: true,
        group_id: true,
        group: {
          select: {
            group_members: {
              select: {
                user: {
                  select: { user_id: true, name: true },
                },
              },
            },
          },
        },
        members: {
          select: {
            user: {
              select: { user_id: true, name: true },
            },
          },
        },
      },
    });

    if (!chatroom) {
      const error = AppErrorFactory.chatroomAccessDenied();
      res.status(error.status).send(error);
      return;
    }

    const members =
      chatroom.type === 'group'
        ? (chatroom.group?.group_members.map((m) => m.user) ?? [])
        : chatroom.members.map((m) => m.user);

    res.send({ success: true, data: { members } });
  } catch (error) {
    next(error);
  }
};
