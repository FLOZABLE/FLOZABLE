import Joi from 'joi';

import { otherSchemas } from './otherSchemas';

export const getRankingSchema = Joi.object({
  viewer: otherSchemas.viewer,
  date: otherSchemas.date,
  timezone: otherSchemas.timezone,
});
