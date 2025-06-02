import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a user interface for better type safety
interface JwtUser {
  userId: string;
  displayName?: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.redirect('/auth/login');
      return;
    }

    try {
      // Use a promisified version without the utility
      const decoded = await new Promise<JwtUser>((resolve, reject) => {
        jwt.verify(
          token, 
          process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err: Error | null, decoded: any) => {
            if (err) reject(err);
            else resolve(decoded as JwtUser);
          }
        );
      });
      
      req.user = decoded;
      next();
    } catch (error) {
      res.redirect('/auth/login');
    }
  } catch (error) {
    next(error);
  }
};

// Simple middleware to check if user is logged in via session
export const checkSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.session?.user) {
      // User is authenticated via session
      next();
    } else {
      // If no user in session, redirect to login page
      res.redirect('/');
    }
  } catch (error) {
    next(error);
  }
};
