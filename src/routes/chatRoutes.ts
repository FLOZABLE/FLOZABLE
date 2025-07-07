import { Router } from 'express';

import { getChatRoomAll } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const chatRouter = Router();

chatRouter.get('/room/all', authMiddleware, getChatRoomAll);

export default chatRouter;
