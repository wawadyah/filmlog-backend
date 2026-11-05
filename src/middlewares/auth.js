import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        message: 'Akses ditolak. Token otorisasi tidak ditemukan.'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({
        message: 'Akses ditolak. Format token tidak valid.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'User dengan token ini sudah tidak terdaftar.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Sesi Anda telah berakhir. Silakan login kembali.'
      });
    }
    return res.status(401).json({
      message: 'Token otentikasi tidak valid.'
    });
  }
};
