/**
 * Passport.js Authentication Configuration
 * Supports Local, Google OAuth, and LinkedIn OAuth strategies
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Configure Passport strategies
 */
export function configurePassport() {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (email/password)
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findByEmailWithPassword(email);

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        logger.error('Local authentication error:', error);
        return done(error);
      }
    }
  ));

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ providerId: profile.id, authProvider: 'google' });

          if (user) {
            // Update profile info on login
            user.profilePicture = profile.photos?.[0]?.value || user.profilePicture;
            await user.save();
            return done(null, user);
          }

          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link Google account to existing user
              user.providerId = profile.id;
              user.authProvider = 'google';
              user.profilePicture = profile.photos?.[0]?.value || user.profilePicture;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = new User({
            email: email,
            name: profile.displayName,
            authProvider: 'google',
            providerId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            isActive: true
          });

          await user.save();
          logger.info(`New user registered via Google: ${email}`);
          return done(null, user);
        } catch (error) {
          logger.error('Google authentication error:', error);
          return done(error);
        }
      }
    ));
    logger.info('✅ Google OAuth strategy configured');
  } else {
    logger.warn('⚠️ Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this LinkedIn ID
          let user = await User.findOne({ providerId: profile.id, authProvider: 'linkedin' });

          if (user) {
            // Update profile info on login
            user.profilePicture = profile.photos?.[0]?.value || user.profilePicture;
            await user.save();
            return done(null, user);
          }

          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link LinkedIn account to existing user
              user.providerId = profile.id;
              user.authProvider = 'linkedin';
              user.profilePicture = profile.photos?.[0]?.value || user.profilePicture;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = new User({
            email: email,
            name: profile.displayName,
            authProvider: 'linkedin',
            providerId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            isActive: true
          });

          await user.save();
          logger.info(`New user registered via LinkedIn: ${email}`);
          return done(null, user);
        } catch (error) {
          logger.error('LinkedIn authentication error:', error);
          return done(error);
        }
      }
    ));
    logger.info('✅ LinkedIn OAuth strategy configured');
  } else {
    logger.warn('⚠️ LinkedIn OAuth not configured - missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET');
  }

  return passport;
}

export default passport;
