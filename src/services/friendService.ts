import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getCachedUsers } from './cacheService';
import { sendNotification } from './notificationService';

export const friendRequest = async (userId: string, friendId: string) => {
  if (userId === friendId) {
    return {
      success: false,
      status: 400,
      message: 'Cannot send request to yourself',
      error: { reason: 'Cannot send request to yourself' },
    };
  }

  const users = await getCachedUsers({ userIds: [userId, friendId] });

  const userInfo = users.find((user) => user.user_id === userId);
  const friendInfo = users.find((user) => user.user_id === friendId);

  if (!userInfo || !friendInfo) {
    return AppErrorFactory.userNotFound();
  }

  const friendship_id = nanoid(10);
  const now = nowSec();

  const [userA, userB] = [userId, friendId].sort(); // alphabetical or numerical sort

  try {
    const newFriend = await prisma.friends.create({
      data: {
        friendship_id,
        user_id: userA,
        friend_id: userB,
        date: now,
      },
    });

    sendNotification({
      notification: {
        user_id: friendId,
        sender_id: userId,
        type: 'friend_request',
      },
    });

    return {
      success: true,
      status: 200,
      message: `Sent friend request to ${friendInfo.name}!`,
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      // Unique constraint violation — user already joined
      return {
        success: false,
        message: `You have already sent friend request to ${friendInfo.name}`,
      };
    }
    const response = AppErrorFactory.unknownServerError();
    return response;
  }
};
