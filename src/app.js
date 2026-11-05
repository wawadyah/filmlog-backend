import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import watchedRoutes from './routes/watchedRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 1. Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 2. Health Check & Welcome Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Selamat datang di FilmLog API — GDGoC Recruitment Task',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      watchlist: '/api/watchlist',
      watched: '/api/watched',
      recommend: '/api/movies/recommend'
    }
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'FilmLog API is healthy and operational',
    version: '1.0.0'
  });
});

// 3. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watched', watchedRoutes);

// 4. Fallback 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

export default app;
