import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  // 1. Zod Validation Error (HTTP 400)
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      message: 'Validasi input gagal.',
      errors: errorDetails
    });
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` (${err.meta.target})` : '';
      return res.status(409).json({
        message: `Data sudah terdaftar sebelumnya${target}.`
      });
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Data yang dicari tidak ditemukan.'
      });
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'Relasi data tidak valid. Foreign key ID tidak ditemukan.'
      });
    }
  }

  // 3. Custom status code if provided
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
