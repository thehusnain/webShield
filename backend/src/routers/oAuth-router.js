import express from 'express';
import { 
    googleAuth, 
    googleCallback, 
    githubAuth, 
    githubCallback,
    checkOAuthUser 
} from '../controllers/oAuth-controller.js';

const oauthRouter = express.Router();

// Google OAuth routes
oauthRouter.get('/google', googleAuth);
oauthRouter.get('/google/callback', googleCallback);

// GitHub OAuth routes
oauthRouter.get('/github', githubAuth);
oauthRouter.get('/github/callback', githubCallback);

// Check if user exists (for frontend)
oauthRouter.post('/check-user', checkOAuthUser);

export default oauthRouter;