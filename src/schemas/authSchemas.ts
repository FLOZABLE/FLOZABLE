import Joi from 'joi';

import { accountSchemas } from './accountSchemas';
import { googleSchemas } from './googleSchemas';
import { otherSchemas } from './otherSchemas';

export const authSchemas = {};

export const postAuthSignupSchema = Joi.object({
  email: accountSchemas.email,
  name: accountSchemas.name,
  password: accountSchemas.password,
  timezone: otherSchemas.timezone,
});

export const postAuthLoginSchema = Joi.object({
  email: accountSchemas.email,
  password: accountSchemas.password,
});

export const getAuthGoogleCallbackSchema = Joi.object({
  code: googleSchemas.code,
  state: googleSchemas.state,
}).unknown(true);
