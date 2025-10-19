import Joi from 'joi';

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
