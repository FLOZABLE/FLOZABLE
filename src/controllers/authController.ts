import { Request, Response, NextFunction } from 'express';
import { SignupRequestBody } from '../types/authTypes';
import { createUser } from '../services/authService';
import { createSubject } from '../services/subjectService';

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
