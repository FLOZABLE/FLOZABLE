import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { delCachedUserNotificationTokens } from '../services/cacheService';
import {
  NotificationIdParams,
  PostNotificationTokenBody,
} from '../types/notificationTypes';
import { PutNotificationTokenBody } from './../types/notificationTypes';

export const getNotificationsAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const rawNotifications = await prisma.notifications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        sent_at: 'desc',
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
        sender: {
          select: {
            name: true,
            timezone: true,
            created_at: true,
          },
        },
      },
    });

    const notifications = rawNotifications.map((notification) => {
      let message = '';

      switch (notification.type) {
        case 'friend_request':
          message = `${notification.sender?.name || 'Someone'} sent you a friend request`;
          break;

        case 'friend_accepted':
          message = `${notification.sender?.name || 'Someone'} accepted your friend request`;
          break;

        case 'group_invite':
          message = `${notification.sender?.name || 'Someone'} invited you to join the group "${notification.group?.name}"`;
          break;

        case 'chat_request':
          message = `${notification.sender?.name || 'Someone'} invited you to a chat`;
          break;

        case 'global':
          message = notification.message || 'You have a new notification';
          break;

        default:
          message = notification.message || 'You have a notification';
      }

      return {
        ...notification,
        message,
        sender: notification.sender
          ? {
              user_id: notification.sender_id,
              name: notification.sender.name,
              timezone: notification.sender.timezone,
              created_at: notification.sender.created_at,
            }
          : undefined,
        group: notification.group
          ? {
              group_id: notification.group_id,
              name: notification.group.name,
            }
          : undefined,
      };
    });

    res.send({ success: true, status: 200, data: { notifications } });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request<NotificationIdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { notification_id } = req.params;

    await prisma.notifications.delete({
      where: {
        notification_id,
        user_id: userId,
      },
    });

    res.send({ success: true, status: 200, message: 'Deleted notification' });
  } catch (error) {
    next(error);
  }
};

export const postNotificationToken = async (
  req: Request<{}, {}, PostNotificationTokenBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { device_id } = req.body;

    const device = await prisma.devices.findUnique({
      where: {
        device_id_user_id: {
          device_id,
          user_id: userId,
        },
      },
      select: {
        notification_token: true,
      },
    });

    res.send({
      success: true,
      status: 200,
      data: {
        token: device?.notification_token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const putNotificationToken = async (
  req: Request<{}, {}, PutNotificationTokenBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { token, device_id } = req.body;

    await prisma.devices.update({
      where: {
        device_id_user_id: {
          device_id,
          user_id: userId,
        },
      },
      data: {
        notification_token: token,
      },
    });

    await delCachedUserNotificationTokens(userId);

    res.send({ success: true, status: 200 });
  } catch (error) {
    next(error);
  }
};
