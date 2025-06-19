import { NextFunction, Request, Response } from 'express';
import { GaxiosError } from 'gaxios';

import { Prisma } from '../generated/prisma';
import { AppErrorFactory } from '../libs/errors';
import { delCacheUserGoogleAccessToken } from '../services/cacheService';

export interface AppError extends Error {
  status: number;
  description?: string;
  error?: {
    reason: string;
    code: string | number;
  };
}

const isProd = process.env.NODE_ENV === 'production';

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError && isProd) {
    res.status(err.status || 500).json({
      success: false,
      code: err.status || 500,
      message: 'Internal Server Error',
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    code: err.status || 500,
    message: err.message || 'Internal Server Error',
    description: err.description || '',
    error: err.error || {
      reason: err.message || 'Internal Server Error',
      code: err.status || 500,
    },
  });
};

export const googleErrorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof GaxiosError &&
    err.response?.data?.error === 'invalid_token'
  ) {
    if (req.user_id) await delCacheUserGoogleAccessToken(req.user_id);

    if (!res.headersSent) {
      const response = AppErrorFactory.googleOAuthFailed();
      res.status(response.status).send(response);
      return;
    }
  }

  next(err);
};
