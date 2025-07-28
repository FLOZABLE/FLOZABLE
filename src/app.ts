import path from 'path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

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

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json({ limit: '5mb' }));

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: config.serverCors,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
  }),
);

app.use(helmet());

const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    frameSrc: ["'self'"],
    'img-src': ["'self'"],
    'form-action': ["'self'"],
  },
};

app.use(helmet.contentSecurityPolicy(cspOptions));

app.use(express.static(path.join(__dirname, '/public')));
app.disable('etag');
app.use(morgan('combined'));
app.use(compression());

app.use(
  express.static(path.join(__dirname, '/public'), {
    maxAge: '1d',
    etag: false,
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

app.use('/{*any}', (_req, res, _next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
