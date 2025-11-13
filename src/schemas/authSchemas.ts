import Joi from 'joi';

import { accountSchemas } from './accountSchemas';
import { appleSchemas } from './appleSchemas';
import { deviceSchemas } from './deviceSchemas';
import { googleSchemas } from './googleSchemas';
import { otherSchemas } from './otherSchemas';

export const authSchemas = {};

export const postAuthSignupSchema = Joi.object({
  email: accountSchemas.email,
  name: accountSchemas.name,
  password: accountSchemas.password,
  timezone: otherSchemas.timezone,
});

export const postAuthSignupAppSchema = Joi.object({
  email: accountSchemas.email,
  name: accountSchemas.name,
  password: accountSchemas.password,
  timezone: otherSchemas.timezone,
  brand: deviceSchemas.brand,
  device_name: deviceSchemas.name,
  device_id: deviceSchemas.device_id,
});

export const postAuthLoginSchema = Joi.object({
  email: accountSchemas.email,
  password: accountSchemas.password,
});

export const postAuthLoginAppSchema = Joi.object({
  email: accountSchemas.email,
  password: accountSchemas.password,
  brand: deviceSchemas.brand,
  device_name: deviceSchemas.name,
  device_id: deviceSchemas.device_id,
});

export const postAuthTokenVerifySchema = Joi.object({
  device_id: deviceSchemas.device_id,
  token: deviceSchemas.token,
});

export const getAuthGoogleCallbackSchema = Joi.object({
  code: googleSchemas.code,
  state: googleSchemas.state,
}).unknown(true);

export const postAuthGoogleAppSchema = Joi.object({
  code: googleSchemas.code,
  brand: deviceSchemas.brand,
  device_name: deviceSchemas.name,
  device_id: deviceSchemas.device_id,
  timezone: otherSchemas.timezone,
});

export const postAuthAppleSchema = Joi.object({
  code: appleSchemas.code,
  brand: deviceSchemas.brand,
  device_name: deviceSchemas.name,
  device_id: deviceSchemas.device_id,
  timezone: otherSchemas.timezone,
  name: appleSchemas.name,
});
