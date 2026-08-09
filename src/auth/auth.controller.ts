// backend file
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('telegram')
  login(@Body() dto: TelegramLoginDto) {
    const initData = dto?.initData || dto?.body?.initData || dto?.payload?.initData;
    if (!initData) {
      throw new BadRequestException('initData is required');
    }
    return this.auth.loginWithTelegram(initData);
  }
}

