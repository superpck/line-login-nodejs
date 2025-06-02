import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import lineConfig from '../config/line';

// Define interfaces for type safety
interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    user?: LineProfile;
    state?: string;
    nonce?: string;
  }
}

export const login = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Generate random state and nonce for security
    const state = Math.random().toString(36).substring(7);
    const nonce = Math.random().toString(36).substring(7);
    
    // Store state and nonce in session for verification
    req.session.state = state;
    req.session.nonce = nonce;
    
    const lineLoginUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: lineConfig.channelId || '',
      redirect_uri: lineConfig.callbackUrl || '',
      state: state,
      scope: lineConfig.scope,
      nonce: nonce,
    });
    
    res.redirect(`${lineLoginUrl}?${params.toString()}`);
  } catch (error) {
    next(error); // Pass errors to Express error handler
  }
};

export const callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, state } = req.query;
    
    // Verify state parameter to prevent CSRF attacks
    if (state !== req.session.state) {
      const error = new Error('Invalid state parameter') as any;
      error.status = 401;
      throw error;
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post<LineTokenResponse>(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: lineConfig.callbackUrl || '',
        client_id: lineConfig.channelId || '',
        client_secret: lineConfig.channelSecret || '',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    // Get user profile using access token
    const profileResponse = await axios.get<LineProfile>(
      'https://api.line.me/v2/profile',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    
    const userProfile = profileResponse.data;
    
    // Store user info in session
    req.session.user = userProfile;
    
    // Redirect to profile page
    res.redirect('/auth/profile');
  } catch (error) {
    next(error); // Pass errors to Express error handler
  }
};

export const profile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.session.user) {
      res.redirect('/');
      return;
    }
    
    res.render('profile', { user: req.session.user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
};
