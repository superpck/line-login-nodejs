import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { login, callback, profile, logout } from '../../controllers/authController';
import lineConfig from '../../config/line';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      session: {
        destroy: jest.fn((callback) => callback(null)),
      } as any,
      query: {},
    };
    
    mockResponse = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
    
    mockNext = jest.fn();
  });

  describe('login', () => {
    it('should redirect to LINE login URL with correct params', () => {
      // Call the login function
      login(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that state and nonce were set in session
      expect(mockRequest.session?.state).toBeDefined();
      expect(mockRequest.session?.nonce).toBeDefined();
      
      // Check that redirect was called with a URL containing expected params
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
      const redirectUrl = (mockResponse.redirect as jest.Mock).mock.calls[0][0];
      
      // Verify URL components
      expect(redirectUrl).toContain('https://access.line.me/oauth2/v2.1/authorize');
      expect(redirectUrl).toContain(`client_id=${lineConfig.channelId}`);
      expect(redirectUrl).toContain(`redirect_uri=${encodeURIComponent(lineConfig.callbackUrl || '')}`);
      expect(redirectUrl).toContain(`state=${mockRequest.session?.state}`);
      expect(redirectUrl).toContain(`nonce=${mockRequest.session?.nonce}`);
    });

    it('should call next with error if an exception occurs', () => {
      // Setup mock to throw an error
      mockResponse.redirect = jest.fn(() => {
        throw new Error('Redirect error');
      });
      
      // Call the login function
      login(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that next was called with the error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('callback', () => {
    it('should exchange code for token and fetch user profile', async () => {
      // Setup mock request with valid state and code
      mockRequest.query = { code: 'valid-code', state: 'valid-state' };
      mockRequest.session = {
        state: 'valid-state',
      } as any;
      
      // Mock axios responses
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          scope: 'profile',
        }
      });
      
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          userId: 'mock-user-id',
          displayName: 'Mock User',
          pictureUrl: 'https://profile.line-scdn.net/mock-picture',
        }
      });
      
      // Call the callback function
      await callback(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that token request was made with correct params
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.line.me/oauth2/v2.1/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
      
      // Check that profile request was made with the token
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.line.me/v2/profile',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );
      
      // Check that user data was stored in session
      expect(mockRequest.session?.user).toEqual({
        userId: 'mock-user-id',
        displayName: 'Mock User',
        pictureUrl: 'https://profile.line-scdn.net/mock-picture',
      });
      
      // Check that user was redirected to profile page
      expect(mockResponse.redirect).toHaveBeenCalledWith('/auth/profile');
    });

    it('should throw error if state is invalid', async () => {
      // Setup mock request with invalid state
      mockRequest.query = { code: 'valid-code', state: 'invalid-state' };
      mockRequest.session = {
        state: 'valid-state',
      } as any;
      
      // Call the callback function
      await callback(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that next was called with an error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid state parameter',
          status: 401,
        })
      );
    });
  });

  describe('profile', () => {
    it('should render profile view with user data if user is logged in', () => {
      // Setup mock request with user in session
      mockRequest.session = {
        user: {
          userId: 'mock-user-id',
          displayName: 'Mock User',
        }
      } as any;
      
      // Call the profile function
      profile(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that profile view was rendered with user data
      expect(mockResponse.render).toHaveBeenCalledWith('profile', {
        user: mockRequest.session?.user
      });
    });

    it('should redirect to home if user is not logged in', () => {
      // Setup mock request without user in session
      mockRequest.session = {} as any;
      
      // Call the profile function
      profile(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that user was redirected to home
      expect(mockResponse.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('logout', () => {
    it('should destroy session and redirect to home', () => {
      // Call the logout function
      logout(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that session was destroyed
      expect(mockRequest.session?.destroy).toHaveBeenCalled();
      
      // Check that user was redirected to home
      expect(mockResponse.redirect).toHaveBeenCalledWith('/');
    });

    it('should call next with error if session destruction fails', () => {
      // Setup mock to make session.destroy fail
      mockRequest.session = {
        destroy: jest.fn((callback) => callback(new Error('Session destruction error'))),
      } as any;
      
      // Call the logout function
      logout(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Check that next was called with the error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
