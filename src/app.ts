import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import config from './config/config';
import { errorHandler } from './middlewares/errorHandler';
import accountRouter from './routes/accountRoutes';
import authRouter from './routes/authRoutes';
import chatRouter from './routes/chatRoutes';
import friendRouter from './routes/friendRoutes';
import groupRouter from './routes/groupRoutes';
import notificationRouter from './routes/notificationRoutes';
import planRouter from './routes/planRoutes';
import rankingRouter from './routes/rankingRoutes';
import subjectRoutes from './routes/subjectRoutes';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: config.serverCors,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
  }),
);

// Routes
app.use('/auth', authRouter);
app.use('/account', accountRouter);
app.use('/subject', subjectRoutes);
app.use('/ranking', rankingRouter);
app.use('/group', groupRouter);
app.use('/plan', planRouter);
app.use('/friend', friendRouter);
app.use('/notification', notificationRouter);
app.use('/chat', chatRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
