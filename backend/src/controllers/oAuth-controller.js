import { passport, generateToken } from '../utils/oAuth-config.js';
import { User } from '../models/users-mongo.js';

// Google OAuth Start
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// Google OAuth Callback
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user) => {
        if (err || !user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&username=${user.username}`);
    })(req, res, next);
};

// GitHub OAuth Start
export const githubAuth = passport.authenticate('github', {
    scope: ['user:email']
});

// GitHub OAuth Callback
export const githubCallback = (req, res, next) => {
    passport.authenticate('github', (err, user) => {
        if (err || !user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        
        const token = generateToken(user);
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&username=${user.username}`);
    })(req, res, next);
};

// Check if OAuth user exists
export const checkOAuthUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (user) {
            return res.json({
                exists: true,
                isOAuth: user.password === 'oauth-user-no-password',
                username: user.username
            });
        }
        
        res.json({ exists: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};