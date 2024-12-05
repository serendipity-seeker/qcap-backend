import { Router } from 'express';
import revenueRoutes from './revenueRoutes';

const router = Router();

router.use('/revenues', revenueRoutes);

export default router; 