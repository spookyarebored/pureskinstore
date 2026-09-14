// ===========================================
// PureSkin Store — Express App
// ===========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import stockRoutes from './routes/stock';
import ticketRoutes from './routes/tickets';
import restockRoutes from './routes/restock';
import statsRoutes from './routes/stats';
import logsRoutes from './routes/logs';
import discordRoutes from './routes/discord';
import settingsRoutes from './routes/settings';

const app = express();

// --- Security ---
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
}));

app.use(cors({
  origin: config.webUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// --- Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Logging ---
if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// --- Rate Limiting ---
app.use('/api/', apiLimiter);

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'PureSkin Store API is running', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/restock', restockRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/settings', settingsRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
