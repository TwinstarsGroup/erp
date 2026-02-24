import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, id?: string) => void) {
    done(null, user.id);
  }

  async deserializeUser(id: string, done: (err: Error | null, user?: any) => void) {
    const user = await this.authService.findById(id);
    done(null, user || undefined);
  }
}
