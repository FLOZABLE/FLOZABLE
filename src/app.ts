import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './routes/authRoutes';
import cors from 'cors';
import config from './config/config';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.serverCors,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
  }),
);

// Routes
app.use('/auth', authRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
