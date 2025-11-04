import { Prisma } from '../generated/prisma';

export interface RawNotification
  extends Prisma.notificationsUncheckedCreateInput {}

export interface Notification extends Prisma.notificationsCreateInput {}

export type NotificationIdParams = {
  notification_id: string;
};

export type PostNotificationTokenBody = {
  device_id: string;
};


export type PutNotificationTokenBody = {
  token: string;
  device_id: string;
};
