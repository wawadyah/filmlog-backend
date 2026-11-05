import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎬 FilmLog Backend API running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🚀 Base API: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
