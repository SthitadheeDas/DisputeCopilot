import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG, PROJECT_ROOT } from './config.js';
import healthRouter from './routes/health.js';
import disputesRouter from './routes/disputes.js';

const app = express();

// Rate limiter for AI analysis endpoints to protect external API quotas
const aiRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const aiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === 'POST' && req.path.includes('/analyze')) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 30; // 30 analyses per minute per IP

    const record = aiRateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      aiRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      record.count += 1;
      if (record.count > maxRequests) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded for AI dispute analysis. Please wait a minute before retrying.',
        });
        return;
      }
    }
  }
  next();
};

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://disputecopilot-front.onrender.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, same-origin, server-to-server) or from approved origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(aiRateLimiter);

// API Routes
app.use('/api', healthRouter);
app.use('/api', disputesRouter);

// Serve web frontend build if it exists (Single deployable service)
const webDistPath = path.join(PROJECT_ROOT, 'web', 'dist');
if (fs.existsSync(webDistPath)) {
  console.log(`[Server] Serving production static files from ${webDistPath}`);
  app.use(express.static(webDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(CONFIG.port, () => {
  console.log(`===============================================`);
  console.log(` Dispute Copilot Backend running on port ${CONFIG.port}`);
  console.log(` DATA_MODE: ${CONFIG.dataMode.toUpperCase()}`);
  console.log(` DRY_RUN:   ${CONFIG.dryRun}`);
  console.log(` Health:    http://localhost:${CONFIG.port}/api/health`);
  console.log(` Disputes:  http://localhost:${CONFIG.port}/api/disputes`);
  console.log(`===============================================`);
});

export default app;
