import { z } from 'zod';
import prisma from '../config/prisma.js';
import { getGroundedRecommendation } from '../services/geminiService.js';
import { formatMovie } from './movieController.js';

const aiRequestSchema = z.object({
  prompt: z.string().min(3, 'Deskripsi suasana film minimal 3 karakter')
});

export const getMovieRecommendation = async (req, res, next) => {
  try {
    const rawPrompt = req.body.prompt || req.body.query || req.body.description;

    const validated = aiRequestSchema.parse({
      prompt: typeof rawPrompt === 'string' ? rawPrompt.trim() : ''
    });

    // 1. Fetch all local movies from SQLite to ground Gemini
    const allMovies = await prisma.movie.findMany({
      orderBy: { id: 'asc' }
    });

    if (allMovies.length === 0) {
      return res.status(500).json({
        message: 'Database film lokal masih kosong. Silakan jalankan seeder terlebih dahulu.'
      });
    }

    // 2. Call Gemini service with grounding
    const { movie_id, reasoning } = await getGroundedRecommendation(validated.prompt, allMovies);

    // 3. Retrieve the full movie record
    const recommendedMovie = allMovies.find(m => m.id === movie_id);

    return res.status(200).json({
      movie_id,
      reasoning,
      movie: formatMovie(recommendedMovie)
    });
  } catch (error) {
    if (error.message && error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        message: error.message
      });
    }
    next(error);
  }
};
