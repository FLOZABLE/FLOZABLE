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

const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

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

app.disable('etag');
app.use(compression());
// Use Morgan with a skip function
config.logger &&
  app.use(
    morgan('combined', {
      skip: (req, _res) => /\.(jpe?g|png|gif|webp|svg)$/i.test(req.originalUrl),
    }),
  );

app.use(
  publicLimiter,
  express.static(path.join(__dirname, '/public'), {
    maxAge: '1d',
    etag: false,
  }),
);

// Routes
app.use('/auth', apiLimiter, authRouter);
app.use('/account', apiLimiter, accountRouter);
app.use('/subject', apiLimiter, subjectRoutes);
app.use('/ranking', apiLimiter, rankingRouter);
app.use('/group', apiLimiter, groupRouter);
app.use('/plan', apiLimiter, planRouter);
app.use('/friend', apiLimiter, friendRouter);
app.use('/notification', apiLimiter, notificationRouter);
app.use('/chat', apiLimiter, chatRouter);

app.use('/{*any}', (_req, res, _next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
