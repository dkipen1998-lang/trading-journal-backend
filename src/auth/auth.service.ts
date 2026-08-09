// backend file
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { verifyTelegramInitData, parseTelegramUser } from './telegram-verify.util';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async loginWithTelegram(initData: string) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new UnauthorizedException('Server is missing TELEGRAM_BOT_TOKEN');
    }

    const isValid = verifyTelegramInitData(initData, botToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram initData signature');
    }

    const tgUser = parseTelegramUser(initData);
    if (!tgUser) {
      throw new UnauthorizedException('initData is missing user info');
    }

    const user = await this.users.upsertFromTelegram(tgUser);

    const token = await this.jwt.signAsync({ sub: user.id });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        photoUrl: user.photoUrl,
      },
    };
  }
}

