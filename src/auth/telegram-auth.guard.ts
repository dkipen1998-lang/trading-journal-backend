// backend file
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Decodes the JWT issued by /auth/telegram and attaches req.user.id
@Injectable()
export class TelegramAuthGuard extends AuthGuard('jwt') {}

