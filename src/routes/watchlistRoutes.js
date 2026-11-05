import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from '../controllers/watchlistController.js';

const router = Router();

// All watchlist routes require authentication
router.use(authenticateToken);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);

export default router;
