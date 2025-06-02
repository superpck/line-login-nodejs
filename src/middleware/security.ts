import { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

// Basic rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour.'
});

// Check for CSRF token
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Simple CSRF protection - checks Origin/Referer header
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [process.env.APP_URL || 'http://localhost:3100'];
  
  // Only check for POST, PUT, DELETE, PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      const error = new Error('CSRF validation failed') as any;
      error.status = 403;
      return next(error);
    }
  }
  
  next();
};

// Content Security Policy middleware (added for completeness, 
// but we already have it in helmet configuration)
export const contentSecurityPolicy = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://profile.line-scdn.net"
  );
  next();
};

// Custom middleware to set security headers (in addition to helmet)
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Only send the Referer header for same-origin requests
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Disable storing cookies in cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
};
