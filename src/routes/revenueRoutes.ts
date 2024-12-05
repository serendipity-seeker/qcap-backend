import { Router } from 'express';
import { 
  getRevenues, 
  getRevenueByEpochAndAsset, 
  createRevenue, 
  updateRevenue, 
  deleteRevenue,
  getRevenuesByEpoch,
  getRevenuesByAsset
} from '../controllers/revenueController';

const router = Router();

router.get('/epoch/:epoch', (req, res, next) => {
  getRevenuesByEpoch(req, res, next).catch(next);
});

router.get('/asset/:asset', (req, res, next) => {
  getRevenuesByAsset(req, res, next).catch(next);
});

router.get('/', (req, res, next) => {
  getRevenues(req, res, next).catch(next);
});

router.get('/:epoch/:asset', (req, res, next) => {
  getRevenueByEpochAndAsset(req, res, next).catch(next);
});

router.post('/', (req, res, next) => {
  createRevenue(req, res, next).catch(next);
});

router.put('/:epoch/:asset', (req, res, next) => {
  updateRevenue(req, res, next).catch(next);
});

router.delete('/:epoch/:asset', (req, res, next) => {
  deleteRevenue(req, res, next).catch(next);
});

export default router;
