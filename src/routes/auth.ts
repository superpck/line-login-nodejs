import express from 'express';
import * as authController from '../controllers/authController';
import { checkSession } from '../middleware/auth';

const router = express.Router();

// Route for LINE login
router.get('/login', authController.login);

// Route for LINE callback
router.get('/callback', authController.callback);

// Route for user profile (protected)
router.get('/profile', checkSession, authController.profile);

// Route for logout
router.get('/logout', authController.logout);

export default router;
