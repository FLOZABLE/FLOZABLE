import { NextFunction, Request, Response } from 'express';

export const getExtensionToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    res.send({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};
