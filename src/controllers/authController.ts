import { NextFunction, Request, Response } from 'express';

import { COOKIE_TTL } from '../libs/constants';
import { createUser, loginUser } from '../services/authService';
import { createSession } from '../services/sessionService';
import { createSubject } from '../services/subjectService';
import { LoginRequestBody, SignupRequestBody } from '../types/authTypes';

export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, timezone, password } = req.body;

    const newUser = await createUser({ name, email, timezone, password });
    const newSubject = await createSubject({
      name: 'others',
      color: '#000000',
      users: {
        connect: { user_id: newUser.user_id },
      },
    });

    console.log(newUser, newSubject);

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });
    const token = await createSession(user.user_id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: COOKIE_TTL.LOGIN_TOKEN_EXP,
    });

    res.send({ success: true, token });
  } catch (error) {
    next(error);
  }
};
