import express from 'express';
import cors from 'cors';
import prisma from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { startWeeklyDataFetch } from './services/scheduler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handler should be last
app.use(errorHandler);

// Start the scheduler
startWeeklyDataFetch();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing HTTP server...');
  await server.close();
  await prisma.$disconnect(); 
  process.exit(0);
});

const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:${process.env.PORT || 3000}
Environment: ${process.env.NODE_ENV || 'development'}`)
);

// Enable keep-alive
server.keepAliveTimeout = 65000; // Slightly higher than ALB's idle timeout
server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout
