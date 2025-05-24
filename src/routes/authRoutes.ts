import { Router } from 'express';
import { validate } from '../middlewares/validationMiddleWare';
import { registerAccountSchema } from '../schemas/authSchemas';
import { signup } from '../controllers/authController';

const authRouter = Router();

authRouter.post('/signup', validate(registerAccountSchema, 'body'), signup);

export default authRouter;
