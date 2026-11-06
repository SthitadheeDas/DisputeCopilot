import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG, PROJECT_ROOT } from './config.js';
import healthRouter from './routes/health.js';
import disputesRouter from './routes/disputes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
