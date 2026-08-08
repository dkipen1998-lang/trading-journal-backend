import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramUserPayload } from '../auth/telegram-verify.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertFromTelegram(tgUser: TelegramUserPayload) {
    return this.prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username ?? undefined,
        firstName: tgUser.first_name ?? undefined,
        photoUrl: tgUser.photo_url ?? undefined,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username,
        firstName: tgUser.first_name,
        photoUrl: tgUser.photo_url,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
