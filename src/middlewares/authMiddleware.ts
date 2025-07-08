import { NextFunction, Request, Response } from 'express';
import type { ParsedQs } from 'qs';

import { getUserIdByToken } from '../services/sessionService';

export const authMiddleware = async <Q = ParsedQs>(
  req: Request<{}, {}, {}, Q>,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const userId = await getUserIdByToken(token);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  req.user_id = userId;
  next();
};
