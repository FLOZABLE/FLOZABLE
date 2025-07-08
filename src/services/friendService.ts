import { nanoid } from 'nanoid';

import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { delCachedUserFriends, getCachedUsers } from './cacheService';
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
  const userInfo = users.find((u) => u.user_id === userId);
  const friendInfo = users.find((u) => u.user_id === friendId);

  if (!userInfo || !friendInfo) {
    return AppErrorFactory.userNotFound();
  }

  const [userA, userB] = [userId, friendId].sort(); // enforce bidirectional uniqueness

  // check if friendship already exists
  const existing = await prisma.friends.findFirst({
    where: {
      user_id: userA,
      friend_id: userB,
    },
  });

  if (existing) {
    if (existing.status === 'pending') {
      return {
        success: false,
        status: 409,
        message: `Friend request already sent.`,
      };
    } else if (existing.status === 'accepted') {
      return {
        success: false,
        status: 409,
        message: `${friendInfo.name} is already your friend.`,
      };
    }
  }

  const friendship_id = nanoid(10);
  const now = nowSec();

  try {
    // Create new friend request (pending status)
    const newFriend = await prisma.friends.create({
      data: {
        friendship_id,
        user_id: userA,
        friend_id: userB,
        status: 'pending',
        date: now,
      },
    });

    // Send friend request notification
    await sendNotification({
      notification: {
        user_id: friendId,
        sender_id: userId,
        type: 'friend_request',
        friend_request_id: newFriend.friendship_id,
        title: `New friend request`,
        message: `${userInfo.name} sent friend request`,
      },
      sender: userInfo,
    });

    return {
      success: true,
      status: 200,
      message: `Sent friend request to ${friendInfo.name}!`,
    };
  } catch (err) {
    console.error(err);
    return AppErrorFactory.unknownServerError();
  }
};

export const replyFriendRequest = async (
  userId: string,
  friendshipId: string,
  isAccepted: boolean,
) => {
  try {
    const friendship = await prisma.friends.findUnique({
      where: {
        friendship_id: friendshipId,
      },
      include: {
        user: {
          select: { user_id: true, name: true },
        },
        friend: {
          select: { user_id: true, name: true },
        },
      },
    });

    if (!friendship) {
      return {
        success: false,
        status: 404,
        message: 'Friend request not found',
      };
    }

    const target =
      friendship.user_id === userId ? friendship.friend : friendship.user;
    const targetName = target.name;

    if (isAccepted) {
      await prisma.friends.update({
        where: {
          friendship_id: friendshipId,
        },
        data: {
          status: 'accepted',
        },
      });

      await prisma.notifications.deleteMany({
        where: {
          friend_request_id: friendshipId,
          user_id: userId,
        },
      });

      await delCachedUserFriends(userId);

      return {
        success: true,
        status: 200,
        message: `You and ${targetName} are now friends!`,
      };
    } else {
      await prisma.friends.delete({
        where: {
          friendship_id: friendshipId,
        },
      });

      return {
        success: true,
        status: 200,
        message: 'Declined friend request!',
      };
    }
  } catch (err) {
    console.log(err);
    return AppErrorFactory.unknownServerError();
  }
};
