import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getMainIo } from '../sockets/mainIo';
import { UserInfo } from '../types/accountTypes';
import { RawNotification } from '../types/notificationTypes';

interface SendNotificationParams {
  notification: Omit<RawNotification, 'notification_id' | 'sent_at'>;
  sender?: UserInfo;
  isDynamicMessage?: boolean;
}

export const sendNotification = async ({
  notification,
  sender,
  isDynamicMessage,
}: SendNotificationParams) => {
  try {
    const notification_id = nanoid(10);
    const sent_at = nowSec();

    const newNotification = await prisma.notifications.create({
      data: {
        notification_id,
        sent_at,
        ...notification,
        message: isDynamicMessage ? notification.message : null, //don't store message when it's dynamic message
      },
    });

    newNotification;

    const mainIo = getMainIo();
    mainIo
      ?.to(newNotification.user_id)
      .emit('notification', {
        ...newNotification,
        message: notification.message,
        sender,
      });
  } catch (err) {
    console.log(err);
  }
};
