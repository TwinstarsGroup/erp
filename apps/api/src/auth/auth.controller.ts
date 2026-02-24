import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Res() res: Response) {
    res.redirect(process.env.WEB_URL || 'http://localhost:3000');
  }

  @Get('me')
  me(@Req() req: Request) {
    if (!req.user) {
      return { user: null };
    }
    const { id, email, name } = req.user as any;
    return { user: { id, email, name } };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.redirect(process.env.WEB_URL || 'http://localhost:3000');
    });
  }
}
