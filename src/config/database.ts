import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasourceUrl: process.env.DATABASE_URL,
});

// Test the database connection
prisma.$connect()
  .then(() => {
    console.log(' Database connection established successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default prisma; 