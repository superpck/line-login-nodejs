import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

// Extend Express Request type to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

const verifyToken = promisify<string, string, any>(jwt.verify);

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.redirect('/auth/login');
    return;
  }

  try {
    const decoded = await verifyToken(token, process.env.JWT_SECRET || '');
    req.user = decoded;
    next();
  } catch (error) {
    res.redirect('/auth/login');
  }
};

// Simple middleware to check if user is logged in via session
export const checkSession = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};
