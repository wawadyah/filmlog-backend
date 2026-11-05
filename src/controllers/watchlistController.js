import prisma from '../config/prisma.js';
import { formatMovie } from './movieController.js';

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = items.map(item => ({
      id: item.id,
      userId: item.userId,
      movieId: item.movieId,
      movie_id: item.movieId,
      createdAt: item.createdAt,
      movie: formatMovie(item.movie)
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieIdRaw = req.body.movieId ?? req.body.movie_id;

    if (!movieIdRaw) {
      return res.status(400).json({
        message: 'movieId wajib disertakan.'
      });
    }

    const movieId = parseInt(movieIdRaw, 10);
    if (isNaN(movieId)) {
      return res.status(400).json({
        message: 'movieId harus berupa angka.'
      });
    }

    // 1. Verify movie exists (foreign key check)
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return res.status(404).json({
        message: `Film dengan ID ${movieId} tidak ditemukan.`
      });
    }

    // 2. Prevent duplicate entries (Semantic 409 Conflict)
    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        user_movie_unique: {
          userId,
          movieId
        }
      }
    });

    if (existingEntry) {
      return res.status(409).json({
        message: 'Film ini sudah ada di dalam watchlist Anda.'
      });
    }

    const newItem = await prisma.watchlist.create({
      data: {
        userId,
        movieId
      },
      include: {
        movie: true
      }
    });

    return res.status(201).json({
      message: 'Film berhasil ditambahkan ke watchlist.',
      data: {
        id: newItem.id,
        movieId: newItem.movieId,
        movie_id: newItem.movieId,
        movie: formatMovie(newItem.movie)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({
        message: 'movieId tidak valid.'
      });
    }

    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        user_movie_unique: {
          userId,
          movieId
        }
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        message: 'Film tidak ditemukan di dalam watchlist Anda.'
      });
    }

    await prisma.watchlist.delete({
      where: { id: existingEntry.id }
    });

    return res.status(200).json({
      message: 'Film berhasil dihapus dari watchlist.'
    });
  } catch (error) {
    next(error);
  }
};
