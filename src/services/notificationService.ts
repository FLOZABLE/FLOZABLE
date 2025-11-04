import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';
import { nanoid } from 'nanoid';

import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getMainIo } from '../sockets/mainIo';
import { UserInfo } from '../types/accountTypes';
import { RawNotification } from '../types/notificationTypes';
import { getCachedUserNotificationTokens } from './cacheService';

interface SendNotificationParams {
  notification: Omit<RawNotification, 'notification_id' | 'sent_at'>;
  sender?: UserInfo;
  isDynamicMessage?: boolean;
  save?: boolean;
}

export const sendNotification = async ({
  notification,
  sender,
  isDynamicMessage,
  save = true,
}: SendNotificationParams) => {
  try {
    const notification_id = nanoid(10);
    const sent_at = nowSec();

    const newNotification = save
      ? await prisma.notifications.create({
          data: {
            notification_id,
            sent_at,
            ...notification,
            message: isDynamicMessage ? notification.message : null, //don't store message when it's dynamic message
          },
        })
      : {};

    const mainIo = getMainIo();
    mainIo?.to(notification.user_id).emit('notification', {
      ...newNotification,
      message: notification.message,
      sender,
    });

    const tokens = await getCachedUserNotificationTokens({
      userId: notification.user_id,
    });

    console.log('tokens', tokens);

    sendPushNotifications({
      pushTokens: tokens,
      message: {
        to: '',
        title: notification.title || undefined,
        body: notification.message || undefined,
        sound: 'default',
        data: { withSome: 'data' },
        richContent: {
          image: 'https://example.com/statics/some-image-here-if-you-want.jpg',
        },
        //subtitle
      },
    });
  } catch (err) {
    console.log(err);
  }
};

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo({
  //accessToken: process.env.EXPO_ACCESS_TOKEN,
  /*
   * @deprecated
   * The optional useFcmV1 parameter defaults to true, as FCMv1 is now the default for the Expo push service.
   *
   * If using FCMv1, the useFcmV1 parameter may be omitted.
   * Set this to false to have Expo send to the legacy endpoint.
   *
   * See https://firebase.google.com/support/faq#deprecated-api-shutdown
   * for important information on the legacy endpoint shutdown.
   *
   * Once the legacy service is fully shut down, the parameter will be removed in a future PR.
   */
  useFcmV1: true,
});

interface SendPushNotificationsParams {
  pushTokens: ExpoPushToken[];
  message: ExpoPushMessage;
}

export async function sendPushNotifications({
  pushTokens,
  message,
}: SendPushNotificationsParams) {
  const messages: ExpoPushMessage[] = [];
  for (const pushToken of pushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      ...message,
      to: pushToken,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();
}
