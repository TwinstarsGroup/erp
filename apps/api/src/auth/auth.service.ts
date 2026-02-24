import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateGoogleUser(profile: GoogleProfile) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@twinstarsgroup.com';
    if (profile.email !== adminEmail) {
      throw new UnauthorizedException('Access restricted to admin account only');
    }

    const user = await this.prisma.user.upsert({
      where: { googleSub: profile.sub },
      update: {
        email: profile.email,
        name: profile.name,
        ...(profile.refreshToken ? { refreshToken: profile.refreshToken } : {}),
      },
      create: {
        email: profile.email,
        name: profile.name,
        googleSub: profile.sub,
        refreshToken: profile.refreshToken,
      },
    });

    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
