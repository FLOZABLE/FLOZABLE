import { Request, Response, NextFunction } from 'express';
import { SignupRequestBody } from '../types/authTypes';

export const signup = (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};
