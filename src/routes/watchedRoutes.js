import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getWatched, addWatched } from '../controllers/watchedController.js';

const router = Router();

// All watched & review routes require authentication
router.use(authenticateToken);

router.get('/', getWatched);
router.post('/', addWatched);

export default router;
