import { Router } from 'express';

import {
  deletePlan,
  getPlanAll,
  patchPlan,
} from '../controllers/planController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  deletePlanBodySchema,
  deletePlanParamsSchema,
  getPlanAllSchema,
  patchPlanBodySchema,
  patchPlanParamsSchema,
} from '../schemas/planSchemas';

const planRouter = Router();

planRouter.get(
  '/all',
  authMiddleware,
  validate(getPlanAllSchema, 'query'),
  getPlanAll,
);

planRouter.patch(
  '/:plan_id',
  authMiddleware,
  validate(patchPlanParamsSchema, 'params'),
  validate(patchPlanBodySchema, 'body'),
  patchPlan,
);

planRouter.delete(
  '/:plan_id',
  authMiddleware,
  validate(deletePlanParamsSchema, 'params'),
  validate(deletePlanBodySchema, 'body'),
  deletePlan,
);

export default planRouter;
