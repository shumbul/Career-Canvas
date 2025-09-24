import jwt from 'jsonwebtoken';
import { HttpRequest } from '@azure/functions';

const JWT_SECRET = process.env.JWT_SECRET || 'career-canvas-secret-key';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'microsoft';
  picture?: string;
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(request: HttpRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticateToken(request: HttpRequest): UserPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}