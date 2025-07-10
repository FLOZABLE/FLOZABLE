import Joi from 'joi';

export const chatSchemas = {
  chatroom_id: Joi.string().length(10).required().trim().messages({
    'string.length': 'Chatroom id must be exactly 10 characters.',
    'string.empty': 'Chatroom id cannot be empty.',
    'any.required': 'Chatroom id is required.',
  }),

  offset: Joi.number().integer().min(0).required().messages({
    'number.base': 'Offset must be a number.',
    'number.integer': 'Offset must be an integer.',
    'number.min': 'Offset must be at least 0.',
    'any.required': 'Offset is required.',
  }),

  length: Joi.number().integer().min(1).max(60).required().messages({
    'number.base': 'Length must be a number.',
    'number.integer': 'Length must be an integer.',
    'number.min': 'Length must be at least 1.',
    'number.max': 'Length cannot exceed 60.',
    'any.required': 'Length is required.',
  }),
};

export const chatroomIdParamsSchema = Joi.object({
  chatroom_id: chatSchemas.chatroom_id,
});

export const getChatroomMessagesQuerySchema = Joi.object({
  offset: chatSchemas.offset,
  length: chatSchemas.length,
});
