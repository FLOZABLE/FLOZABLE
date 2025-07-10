import { Router } from 'express';

import {
  getChatRoomAll,
  getChatRoomMembers,
  getChatRoomMessages,
  postChatRequest,
  postChatRequestReply,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  chatroomIdParamsSchema,
  getChatroomMessagesQuerySchema,
  postChatRequestBodySchema,
  postChatRequestReplyBodySchema,
} from '../schemas/chatSchemas';

const chatRouter = Router();

chatRouter.get('/room/all', authMiddleware, getChatRoomAll);

chatRouter.get(
  '/room/:chatroom_id/messages',
  authMiddleware,
  validate(chatroomIdParamsSchema, 'params'),
  validate(getChatroomMessagesQuerySchema, 'query'),
  getChatRoomMessages,
);

chatRouter.get(
  '/room/:chatroom_id/members',
  authMiddleware,
  validate(chatroomIdParamsSchema, 'params'),
  getChatRoomMembers,
);

chatRouter.post(
  '/request',
  authMiddleware,
  validate(postChatRequestBodySchema, 'body'),
  postChatRequest,
);

chatRouter.post(
  '/request/reply',
  authMiddleware,
  validate(postChatRequestReplyBodySchema, 'body'),
  postChatRequestReply,
);

export default chatRouter;
