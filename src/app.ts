import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import config from './config/config';
import { errorHandler } from './middlewares/errorHandler';
import accountRouter from './routes/accountRoutes';
import authRouter from './routes/authRoutes';
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

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
