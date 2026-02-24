import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/gmail.send'],
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const user = await this.authService.validateGoogleUser({
        sub: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        refreshToken,
      });
      done(null, user);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
}
