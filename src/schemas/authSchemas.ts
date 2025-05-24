import Joi from 'joi';
import { accountSchemas } from './accountSchemas';

export const registerAccountSchema = Joi.object({
  email: accountSchemas.email,
  name: accountSchemas.name,
  password: accountSchemas.password,
  timezone: accountSchemas.timezone,
});
