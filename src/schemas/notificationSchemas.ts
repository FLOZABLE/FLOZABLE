import Joi from 'joi';

import { deviceSchemas } from './deviceSchemas';

export const notificationSchemas = {
  notification_id: Joi.string().length(10).required().trim().messages({
    'string.length': 'Notification id must be exactly 10 characters.',
    'string.empty': 'Notification id cannot be empty.',
    'any.required': 'Notification id is required.',
  }),
};

export const deleteNotificationSchema = Joi.object({
  notification_id: notificationSchemas.notification_id,
});

export const postNotificationTokenSchema = Joi.object({
  device_id: deviceSchemas.device_id,
});

export const putNotificationTokenSchema = Joi.object({
  token: deviceSchemas.notification_token,
  device_id: deviceSchemas.device_id,
});
