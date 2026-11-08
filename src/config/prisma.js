import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel Serverless environment handling:
// On Vercel, root filesystem is read-only. We copy dev.db to /tmp (the writable directory)
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const candidatePaths = [
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(process.cwd(), 'dev.db')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          break;
        } catch (e) {
          console.error('Failed to copy db to /tmp:', e);
        }
      }
    }
  }
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export default prisma;
