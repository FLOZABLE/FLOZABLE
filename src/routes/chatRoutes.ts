import { Router } from 'express';

import {
  getChatRoomAll,
  getChatRoomMembers,
  getChatRoomMessages,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleWare';
import {
  chatroomIdParamsSchema,
  getChatroomMessagesQuerySchema,
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

export default chatRouter;
