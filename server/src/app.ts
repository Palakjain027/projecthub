import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

import { env } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import freelanceRoutes from './modules/freelance/freelance.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';

const app: Express = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Request ID
app.use((req: Request, _res: Response, next) => {
  req.requestId = uuidv4();
  next();
});

// Logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// ==================== ROUTES ====================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
const apiVersion = `/api/${env.apiVersion}`;

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/users`, usersRoutes);
app.use(`${apiVersion}/projects`, projectsRoutes);
app.use(`${apiVersion}/categories`, categoriesRoutes);
app.use(`${apiVersion}/orders`, ordersRoutes);
app.use(`${apiVersion}/reviews`, reviewsRoutes);
app.use(`${apiVersion}/freelance`, freelanceRoutes);
app.use(`${apiVersion}/notifications`, notificationsRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
