import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getMainIo } from '../sockets/mainIo';
import { UserInfo } from '../types/accountTypes';
import { RawNotification } from '../types/notificationTypes';

interface SendNotificationParams {
  notification: Omit<RawNotification, 'notification_id' | 'sent_at'>;
  sender?: UserInfo;
}

export const sendNotification = async ({
  notification,
  sender,
}: SendNotificationParams) => {
  try {
    const notification_id = nanoid(10);
    const sent_at = nowSec();

    const newNotification = await prisma.notifications.create({
      data: {
        notification_id,
        sent_at,
        ...notification,
      },
    });

    newNotification;

    const mainIo = getMainIo();
    mainIo
      ?.to(newNotification.user_id)
      .emit('notification', { ...newNotification, sender });
  } catch (err) {
    console.log(err);
  }
};
