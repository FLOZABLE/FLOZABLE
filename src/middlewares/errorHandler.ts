import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  status: number;
  description?: string;
  error?: {
    reason: string;
    code: string | number;
  };
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

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
