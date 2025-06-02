import request from 'supertest';
import axios from 'axios';
import app from '../../app';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Make sure app is exported from app.ts
// If not, we'll need to modify that file first

describe('LINE Login Integration Test', () => {
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should serve the login page', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('LINE Login');
  });
  
  it('should redirect to LINE authorization URL on login', async () => {
    const response = await request(app)
      .get('/auth/login')
      .expect(302); // Redirect status code
    
    // Check redirect URL
    const redirectUrl = response.headers.location;
    expect(redirectUrl).toContain('https://access.line.me/oauth2/v2.1/authorize');
    expect(redirectUrl).toContain('response_type=code');
  });
  
  it('should handle callback and authenticate user', async () => {
    // Mock the token response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        scope: 'profile',
      }
    });
    
    // Mock the profile response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        userId: 'test-user-id',
        displayName: 'Test User',
        pictureUrl: 'https://profile.line-scdn.net/test-picture',
      }
    });
    
    // Need to mock session for integration test
    // This is simplified for testing purposes
    const agent = request.agent(app);
    
    // First get the login page to start a session
    await agent.get('/');
    
    // Then visit the login route to set state in session
    await agent.get('/auth/login');
    
    // Then handle the callback (with a fake state that would match)
    // In a real test, we'd need to capture the state from the session
    const response = await agent
      .get('/auth/callback?code=test-code&state=test-state')
      .expect(302); // Should redirect to profile
    
    // Should redirect to profile
    expect(response.headers.location).toBe('/auth/profile');
    
    // Verify token request was made
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.line.me/oauth2/v2.1/token',
      expect.any(URLSearchParams),
      expect.any(Object)
    );
    
    // Verify profile request was made
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.line.me/v2/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token'
        })
      })
    );
  });
});
