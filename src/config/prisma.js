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
      path.resolve(process.cwd(), 'dev.db'),
      path.join('/var/task', 'prisma/dev.db'),
      path.join('/var/task', 'dev.db')
    ];
    let copied = false;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDbPath);
          console.log(`[Vercel DB]: Successfully copied ${p} to ${tmpDbPath}`);
          copied = true;
          break;
        } catch (e) {
          console.error('[Vercel DB Error]: Failed to copy db to /tmp:', e);
        }
      }
    }
    if (!copied) {
      console.warn('[Vercel DB Warning]: Could not find source dev.db in candidate paths:', candidatePaths);
    }
  }
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export default prisma;
