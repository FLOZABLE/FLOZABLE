import { Router } from 'express';

import { getRanking } from '../controllers/rankingController';
import { validate } from '../middlewares/validationMiddleWare';
import { getRankingSchema } from '../schemas/rankingSchemas';

const rankingRouter = Router();

rankingRouter.get('/', validate(getRankingSchema, 'query'), getRanking);

export default rankingRouter;
