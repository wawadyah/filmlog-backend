import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 8000;
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
