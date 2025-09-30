import { NextFunction, Request, Response } from 'express';
import type { ParsedQs } from 'qs';

import { AppErrorFactory } from '../libs/errors';
import { getUserIdByToken } from '../services/sessionService';

export const authMiddleware = async <Q = ParsedQs>(
  req: Request<{}, {}, {}, Q>,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    const response = AppErrorFactory.userNotFound();
    res.status(response.statusCode).send(response);
    return;
  }

  const userId = await getUserIdByToken(token);
  if (!userId) {
    const response = AppErrorFactory.tokenInvalid();
    res.status(response.statusCode).send(response);
    return;
  }

  req.user_id = userId;
  next();
};
