import { nanoid } from 'nanoid';

import { Prisma } from '../generated/prisma';
import { AppErrorFactory } from '../libs/errors';
import prisma from '../libs/prisma';
import { nowSec } from '../libs/utils';
import { getMainIo } from '../sockets/mainIo';

export const friendRequest = async (userId: string, friendId: string) => {
  try {
    if (userId === friendId) {
      return {
        success: false,
        status: 400,
        message: 'Cannot send request to yourself',
        error: { reason: 'Cannot send request to yourself' },
      };
    }

    const friendship_id = nanoid(10);
    const now = nowSec();

    const [userA, userB] = [userId, friendId].sort(); // alphabetical or numerical sort
    console.log(userA, userB);
    const newFriend = await prisma.friends.create({
      data: {
        friendship_id,
        user_id: userA,
        friend_id: userB,
        date: now,
      },
    });

    const mainIo = getMainIo();

    console.log(newFriend);

    return;

    //mainIo?.to(userId).emit('notification', notification);

    //mainIo?.to(friendId).emit('notification', myNotification);
  } catch (err) {
    console.log(err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      // Unique constraint violation — user already joined
      return {
        success: false,
        message: 'You have already sent friend request to this user.',
      };
    }
    const response = AppErrorFactory.unknownServerError();
    return response;
  }
};
