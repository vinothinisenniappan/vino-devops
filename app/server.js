const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Home route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to Vino DevOps Application!',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (used by Kubernetes probes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    app: 'vino-devops-app',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'DevOps CI/CD Pipeline Demo Application',
    endpoints: {
      home: 'GET /',
      health: 'GET /health',
      info: 'GET /api/info'
    }
  });
});

// ──────────────────────────────────────────────
// Server
// ──────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`ℹ️  API info:     http://localhost:${PORT}/api/info`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('👋 Server closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
