import { Router } from 'express';

import { getRanking, getUserRanking } from '../controllers/rankingController';
import { validate } from '../middlewares/validationMiddleWare';
import {
  getRankingSchema,
  getUserRankingSchema,
} from '../schemas/rankingSchemas';

const rankingRouter = Router();

rankingRouter.get('/', validate(getRankingSchema, 'query'), getRanking);

rankingRouter.get(
  '/:user_id',
  validate(getUserRankingSchema, 'query'),
  getUserRanking,
);

export default rankingRouter;
