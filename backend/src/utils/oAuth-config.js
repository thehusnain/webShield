import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/users-mongo.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT token (same as your existing login)
const generateToken = (user) => {
    return jwt.sign(
        {
            username: user.username,
            email: user.email,
            role: user.role,
            userId: user._id
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Serialize user for session (for OAuth)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            // Create new user from Google profile
            user = new User({
                username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
                email: profile.emails[0].value,
                password: 'oauth-user-no-password', // Special flag for OAuth users
                role: 'user',
                scanLimit: 10 // Give OAuth users more scans
            });
            await user.save();
        }
        
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// GitHub OAuth Strategy  
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback",
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // GitHub may not return email publicly
        const email = profile.emails && profile.emails[0] 
            ? profile.emails[0].value 
            : `${profile.username}@github.com`;
        
        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { email: email },
                { username: profile.username }
            ]
        });
        
        if (!user) {
            // Create new user from GitHub profile
            user = new User({
                username: profile.username,
                email: email,
                password: 'oauth-user-no-password',
                role: 'user',
                scanLimit: 10
            });
            await user.save();
        }
        
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

export { passport, generateToken };