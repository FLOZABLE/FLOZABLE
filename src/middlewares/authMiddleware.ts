import { NextFunction, Request, Response } from 'express';

import prisma from '../libs/prisma';
import { getUserIdByToken } from '../services/sessionService';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const userId = await getUserIdByToken(token);
  if (!userId) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: Invalid or expired token' });
  }

  // Attach user to request
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
  });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  (req as any).user = user;
  next();
};
