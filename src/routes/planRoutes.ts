import { Router } from 'express';

import {
  deletePlan,
  getPlanAll,
  patchPlan,
  putPlan,
} from '../controllers/planController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { googleErrorHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleWare';
import {
  deletePlanBodySchema,
  deletePlanParamsSchema,
  getPlanAllSchema,
  patchPlanBodySchema,
  patchPlanParamsSchema,
  putPlanBodySchema,
} from '../schemas/planSchemas';

const planRouter = Router();

planRouter.get(
  '/all',
  authMiddleware,
  validate(getPlanAllSchema, 'query'),
  getPlanAll,
  googleErrorHandler,
);

planRouter.patch(
  '/:plan_id',
  authMiddleware,
  validate(patchPlanParamsSchema, 'params'),
  validate(patchPlanBodySchema, 'body'),
  patchPlan,
  googleErrorHandler,
);

planRouter.delete(
  '/:plan_id',
  authMiddleware,
  validate(deletePlanParamsSchema, 'params'),
  validate(deletePlanBodySchema, 'body'),
  deletePlan,
  googleErrorHandler,
);

planRouter.put(
  '/',
  authMiddleware,
  validate(putPlanBodySchema, 'body'),
  putPlan,
  googleErrorHandler,
);

export default planRouter;
