import express from 'express';
import prisma from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { startWeeklyDataFetch } from './services/scheduler';

const app = express();

// Middleware
app.use(express.json());

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

const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:${process.env.PORT || 3000}`)
);
