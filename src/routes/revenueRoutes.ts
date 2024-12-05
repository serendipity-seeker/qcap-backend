import { Router } from 'express';
import {
  getRevenues,
  getRevenueByEpochAndAsset,
  createRevenue,
  updateRevenue,
  deleteRevenue,
} from '../controllers/revenueController';

const router = Router();

router.get('/', getRevenues);
router.get('/:epoch/:asset', getRevenueByEpochAndAsset);
router.post('/', createRevenue);
router.put('/:epoch/:asset', updateRevenue);
router.delete('/:epoch/:asset', deleteRevenue);

export default router; 