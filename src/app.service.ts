import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit(): Promise<void> {
    await this.authService.seedDefaultAdmins();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
