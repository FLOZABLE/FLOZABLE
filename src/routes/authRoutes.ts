import { Router } from 'express';

import { postLogin, postSignup } from '../controllers/authController';
import { validate } from '../middlewares/validationMiddleWare';
import {
  loginAccountSchema,
  registerAccountSchema,
} from '../schemas/authSchemas';

const authRouter = Router();

authRouter.post('/signup', validate(registerAccountSchema, 'body'), postSignup);
authRouter.post('/login', validate(loginAccountSchema, 'body'), postLogin);

export default authRouter;
