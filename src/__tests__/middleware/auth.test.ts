import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isAuthenticated, checkSession } from '../../middleware/auth';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      session: {
        destroy: jest.fn((callback) => callback(null)),
        id: 'test-session-id',
        cookie: {} as any,
        regenerate: jest.fn(),
        reload: jest.fn(),
        resetMaxAge: jest.fn(),
        save: jest.fn(),
        touch: jest.fn()
      } as any,
    };
    
    mockResponse = {
      redirect: jest.fn(),
    };
    
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should redirect to login if no token is present', async () => {
      // Call the middleware
      await isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Should redirect to login
      expect(mockResponse.redirect).toHaveBeenCalledWith('/auth/login');
      // Next should not be called
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set user and call next if token is valid', async () => {
      // Setup mock request with token
      mockRequest.cookies = { token: 'valid-token' };
      
      // Mock jwt.verify
      (jwt.verify as jest.Mock) = jest.fn((token, secret, callback) => {
        callback(null, { userId: 'mock-user-id' });
      });
      
      // Call the middleware
      await isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Should set user on request
      expect(mockRequest.user).toEqual({ userId: 'mock-user-id' });
      // Should call next
      expect(mockNext).toHaveBeenCalled();
      // Should not redirect
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to login if token is invalid', async () => {
      // Setup mock request with token
      mockRequest.cookies = { token: 'invalid-token' };
      
      // Mock jwt.verify
      (jwt.verify as jest.Mock) = jest.fn((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });
      
      // Call the middleware
      await isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Should redirect to login
      expect(mockResponse.redirect).toHaveBeenCalledWith('/auth/login');
      // Next should not be called
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkSession', () => {
    it('should call next if user is in session', () => {
      // Setup mock request with user in session
      mockRequest.session = {
        user: { userId: 'mock-user-id' }
      } as any;
      
      // Call the middleware
      checkSession(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Should call next
      expect(mockNext).toHaveBeenCalled();
      // Should not redirect
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to home if user is not in session', () => {
      // Setup mock request without user in session
      mockRequest.session = {} as any;
      
      // Call the middleware
      checkSession(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Should redirect to home
      expect(mockResponse.redirect).toHaveBeenCalledWith('/');
      // Next should not be called
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
