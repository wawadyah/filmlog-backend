import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import watchedRoutes from './routes/watchedRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend');

const app = express();

// 1. Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets (CSS, JS, images)
app.use(express.static(frontendPath));

// Simple logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 2. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watched', watchedRoutes);

// 3. API Health & Welcome Route
app.get('/api', (req, res) => {
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

// 4. Serve Frontend Single Page App for root and non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 5. Fallback 404 handler for undefined API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({
    message: `Endpoint API ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 6. Centralized Error Handler
app.use(errorHandler);

export default app;
