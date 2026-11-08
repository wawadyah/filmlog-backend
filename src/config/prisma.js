import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel Serverless environment handling:
// On Vercel, root filesystem is read-only. We copy dev.db to /tmp (the writable directory)
let dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const candidatePaths = [
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(process.cwd(), 'dev.db'),
      path.join('/var/task', 'prisma/dev.db'),
      path.join('/var/task', 'dev.db')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          console.log(`[Vercel DB]: Successfully copied ${p} to ${tmpDbPath}`);
          break;
        } catch (e) {
          console.error('[Vercel DB Error]: Failed to copy db to /tmp:', e);
        }
      }
    }
  }
  dbUrl = 'file:/tmp/dev.db';
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export default prisma;
