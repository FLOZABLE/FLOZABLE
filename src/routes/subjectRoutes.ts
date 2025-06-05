import { Router } from 'express';

import { getSubjectAll, putSubject } from '../controllers/subjectController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import { putSubjectSchema } from '../schemas/subjectSchemas';

const subjectRoutes = Router();

subjectRoutes.get('/all', authMiddleware, getSubjectAll);
subjectRoutes.put(
  '/',
  authMiddleware,
  validate(putSubjectSchema, 'body'),
  putSubject,
);

export default subjectRoutes;
