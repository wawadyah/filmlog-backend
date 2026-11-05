import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const dataPath = path.resolve(__dirname, '../data/movies.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const movies = JSON.parse(rawData);

  console.log(`Found ${movies.length} movies to seed.`);

  for (const movie of movies) {
    const genresString = Array.isArray(movie.genres)
      ? movie.genres.join(', ')
      : String(movie.genres || '');

    const castString = Array.isArray(movie.cast)
      ? movie.cast.join(', ')
      : String(movie.cast || movie.cast_members || '');

    await prisma.movie.upsert({
      where: { id: movie.id },
      update: {
        title: movie.title,
        year: movie.year,
        director: movie.director,
        genres: genresString,
        rating: parseFloat(movie.rating),
        duration: movie.duration,
        synopsis: movie.synopsis,
        poster_url: movie.poster_url,
        cast: castString
      },
      create: {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        director: movie.director,
        genres: genresString,
        rating: parseFloat(movie.rating),
        duration: movie.duration,
        synopsis: movie.synopsis,
        poster_url: movie.poster_url,
        cast: castString
      }
    });
  }

  console.log('✅ Successfully seeded 20 movies into SQLite database!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
