import { z } from 'zod';
import prisma from '../config/prisma.js';
import { formatMovie } from './movieController.js';

const reviewSchema = z.object({
  movieId: z.number().int().positive('ID film harus berupa angka positif'),
  rating: z.number().min(1, 'Rating minimal 1 bintang').max(5, 'Rating maksimal 5 bintang'),
  review: z.string().min(1, 'Catatan ulasan tidak boleh kosong')
});

export const getWatched = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        movie: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = reviews.map(item => ({
      id: item.id,
      userId: item.userId,
      movieId: item.movieId,
      movie_id: item.movieId,
      rating: item.rating,
      review: item.review,
      opinion: item.review,
      createdAt: item.createdAt,
      movie: formatMovie(item.movie)
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const addWatched = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieIdRaw = req.body.movieId ?? req.body.movie_id;
    const ratingRaw = req.body.rating;
    const reviewRaw = req.body.review ?? req.body.opinion;

    const validated = reviewSchema.parse({
      movieId: parseInt(movieIdRaw, 10),
      rating: parseFloat(ratingRaw),
      review: typeof reviewRaw === 'string' ? reviewRaw.trim() : ''
    });

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: validated.movieId }
    });

    if (!movie) {
      return res.status(404).json({
        message: `Film dengan ID ${validated.movieId} tidak ditemukan.`
      });
    }

    const newReview = await prisma.review.create({
      data: {
        userId,
        movieId: validated.movieId,
        rating: validated.rating,
        review: validated.review
      },
      include: {
        movie: true
      }
    });

    return res.status(201).json({
      message: 'Catatan tontonan dan ulasan berhasil disimpan.',
      data: {
        id: newReview.id,
        movieId: newReview.movieId,
        movie_id: newReview.movieId,
        rating: newReview.rating,
        review: newReview.review,
        opinion: newReview.review,
        createdAt: newReview.createdAt,
        movie: formatMovie(newReview.movie)
      }
    });
  } catch (error) {
    next(error);
  }
};
