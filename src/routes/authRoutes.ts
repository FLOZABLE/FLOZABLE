import { Router } from 'express';

import { login, signup } from '../controllers/authController';
import { validate } from '../middlewares/validationMiddleWare';
import {
  loginAccountSchema,
  registerAccountSchema,
} from '../schemas/authSchemas';

const authRouter = Router();

authRouter.post('/signup', validate(registerAccountSchema, 'body'), signup);

authRouter.post('/login', validate(loginAccountSchema, 'body'), login);

authRouter.post('/google', validate(loginAccountSchema, 'body'), login);

export default authRouter;
