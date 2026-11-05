import prisma from '../config/prisma.js';

// Helper to format movie for optimal frontend compatibility
export const formatMovie = (movie) => {
  if (!movie) return null;
  const genresArray = movie.genres ? movie.genres.split(',').map(g => g.trim()) : [];
  const castArray = movie.cast ? movie.cast.split(',').map(c => c.trim()) : [];

  return {
    ...movie,
    genres: genresArray,
    cast: castArray,
    cast_members: movie.cast
  };
};

export const getMovies = async (req, res, next) => {
  try {
    const { genre, search, shuffle } = req.query;

    let movies = await prisma.movie.findMany({
      orderBy: { id: 'asc' }
    });

    // Apply filtering
    if (search) {
      const q = search.toLowerCase().trim();
      movies = movies.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.director && m.director.toLowerCase().includes(q))
      );
    }

    if (genre && genre !== 'ALL') {
      const g = genre.toLowerCase().trim();
      movies = movies.filter(m => 
        m.genres && m.genres.toLowerCase().includes(g)
      );
    }

    // Optional random shuffle
    if (shuffle === 'true' || shuffle === '1') {
      movies.sort(() => Math.random() - 0.5);
    }

    const formatted = movies.map(formatMovie);
    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    if (isNaN(movieId)) {
      return res.status(400).json({
        message: 'ID film tidak valid. Harus berupa angka.'
      });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return res.status(404).json({
        message: `Film dengan ID ${movieId} tidak ditemukan.`
      });
    }

    return res.status(200).json(formatMovie(movie));
  } catch (error) {
    next(error);
  }
};
