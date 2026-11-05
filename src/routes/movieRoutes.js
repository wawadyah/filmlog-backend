import { Router } from 'express';
import { getMovies, getMovieById } from '../controllers/movieController.js';
import { getMovieRecommendation } from '../controllers/aiController.js';

const router = Router();

// Notice: /recommend is placed before /:id to prevent routing conflict
router.get('/', getMovies);
router.post('/recommend', getMovieRecommendation);
router.get('/:id', getMovieById);

export default router;
