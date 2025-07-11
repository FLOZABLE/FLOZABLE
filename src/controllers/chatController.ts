import { NextFunction, Request, Response } from 'express';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import {
  getCachedUserChatStatus,
  getCachedUsers,
} from '../services/cacheService';
import { createChatroom } from '../services/chatService';
import { sendNotification } from '../services/notificationService';
import {
  ChatroomIdParams,
  GetChatRoomMessagesQuery,
  PostChatRequestBody,
  PostChatRequestReplyBody,
} from '../types/chatTypes';

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

    const chatrooms = rawChatrooms.map((c) => {
      const members =
        c.type === 'group'
          ? (c.group?.group_members?.map((m) => m.user_id) ?? [])
          : (c.members?.map((m) => m.user_id) ?? []);

      return {
        chatroom_id: c.chatroom_id,
        type: c.type,
        name: c.group?.name || c.name,
        members,
        last_message: c.messages?.[0] || null,
        last_read: chatStatus[c.chatroom_id]?.last_read_message_id ?? null,
        unreads: chatStatus[c.chatroom_id]?.unreads ?? 0,
        group_id: c.group?.group_id || null,
      };
    });

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

export const postChatRequest = async (
  req: Request<{}, {}, PostChatRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const targetId = req.body.target_id;

    if (userId === targetId) {
      res.status(400).send({
        success: false,
        status: 400,
        message: 'You cannot send a chat request to yourself.',
        error: { reason: 'CANNOT_CHAT_SELF' },
      });
      return;
    }

    // Check for existing room chat with both users
    const existingChat = await prisma.chatrooms.findFirst({
      where: {
        type: 'room',
        members: {
          some: { user_id: userId },
        },
        AND: {
          members: {
            some: { user_id: targetId },
          },
        },
      },
    });

    if (existingChat) {
      res.status(409).send({
        success: false,
        status: 409,
        message: 'Chat room already exists.',
        error: { reason: 'CHAT_ALREADY_EXISTS' },
      });
      return;
    }

    // Check if chat request already exists
    const existingRequest = await prisma.notifications.findFirst({
      where: {
        type: 'chat_request',
        sender_id: userId,
        user_id: targetId,
      },
    });

    if (existingRequest) {
      res.status(409).send({
        success: false,
        status: 409,
        message: 'Chat request already sent.',
        error: { reason: 'DUPLICATE_CHAT_REQUEST' },
      });
      return;
    }

    const [sender, receiver] = await getCachedUsers({
      userIds: [userId, targetId],
    });

    if (!sender || !receiver) {
      const error = AppErrorFactory.userNotFound();
      res.status(error.status).send(error);
      return;
    }

    await sendNotification({
      notification: {
        user_id: targetId,
        sender_id: userId,
        type: 'chat_request',
        title: 'New chat request',
        message: `${sender.name} sent you a chat request.`,
      },
      sender,
    });

    res.send({
      success: true,
      status: 200,
      message: `Sent chat request to ${receiver.name}!`,
    });
  } catch (error) {
    next(error);
  }
};

export const postChatRequestReply = async (
  req: Request<{}, {}, PostChatRequestReplyBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const senderId = req.body.target_id;
    const accepted = req.body.accepted;

    const deleted = await prisma.notifications.deleteMany({
      where: {
        type: 'chat_request',
        sender_id: senderId,
        user_id: userId,
      },
    });

    if (!deleted.count) {
      res.status(404).send({
        success: false,
        status: 404,
        message: 'Chat request not found.',
        error: { reason: 'CHAT_REQUEST_NOT_FOUND' },
      });
      return;
    }

    const [sender, receiver] = await getCachedUsers({
      userIds: [senderId, userId],
    });

    if (!sender || !receiver) {
      const error = AppErrorFactory.userNotFound();
      res.status(error.status).send(error);
      return;
    }

    if (accepted) {
      await createChatroom([sender, receiver]);
      res.send({
        success: true,
        status: 200,
        message: `Accepted request from ${sender.name}!`,
      });
      return;
    }

    res.send({
      success: true,
      status: 200,
      message: `Declined request from ${sender.name}.`,
    });
  } catch (error) {
    next(error);
  }
};
