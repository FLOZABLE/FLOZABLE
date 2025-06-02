import { Router } from 'express';

import { getSubjectAll } from '../controllers/subjectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const subjectRoutes = Router();

subjectRoutes.get('/all', authMiddleware, getSubjectAll);

export default subjectRoutes;
