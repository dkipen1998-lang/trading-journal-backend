import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('telegram')
  login(@Body() dto: TelegramLoginDto) {
    const initData = dto?.initData || dto?.body?.initData || dto?.payload?.initData;
    if (!initData) {
      throw new Error('initData is required');
    }
    return this.auth.loginWithTelegram(initData);
  }
}
