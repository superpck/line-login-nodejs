import express from 'express';
import request from 'supertest';
import * as authController from '../../controllers/authController';
import { checkSession } from '../../middleware/auth';
import authRoutes from '../../routes/auth';

// Mock the auth controller
jest.mock('../../controllers/authController');
jest.mock('../../middleware/auth');

describe('Auth Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // Create a new Express app for each test
    app = express();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Use the auth routes
    app.use('/auth', authRoutes);
  });
  
  it('should route GET /auth/login to login controller', async () => {
    // Setup mock implementation
    (authController.login as jest.Mock).mockImplementation((req, res) => {
      res.status(200).send('Login page');
    });
    
    // Make request
    const response = await request(app).get('/auth/login');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(authController.login).toHaveBeenCalled();
  });
  
  it('should route GET /auth/callback to callback controller', async () => {
    // Setup mock implementation
    (authController.callback as jest.Mock).mockImplementation((req, res) => {
      res.status(200).send('Callback processed');
    });
    
    // Make request
    const response = await request(app).get('/auth/callback');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(authController.callback).toHaveBeenCalled();
  });
  
  it('should route GET /auth/profile to profile controller with session check', async () => {
    // Setup mock implementation
    (checkSession as jest.Mock).mockImplementation((req, res, next) => next());
    (authController.profile as jest.Mock).mockImplementation((req, res) => {
      res.status(200).send('Profile page');
    });
    
    // Make request
    const response = await request(app).get('/auth/profile');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(checkSession).toHaveBeenCalled();
    expect(authController.profile).toHaveBeenCalled();
  });
  
  it('should route GET /auth/logout to logout controller', async () => {
    // Setup mock implementation
    (authController.logout as jest.Mock).mockImplementation((req, res) => {
      res.status(200).send('Logged out');
    });
    
    // Make request
    const response = await request(app).get('/auth/logout');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(authController.logout).toHaveBeenCalled();
  });
});
