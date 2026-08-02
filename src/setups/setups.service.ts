import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SetupsService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.setup.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  create(userId: string, name: string) {
    return this.prisma.setup.upsert({
      where: { userId_name: { userId, name } },
      update: {},
      create: { userId, name },
    });
  }

  async remove(userId: string, id: string) {
    const setup = await this.prisma.setup.findFirst({ where: { id, userId } });
    if (!setup) throw new NotFoundException('Setup not found');
    await this.prisma.setup.delete({ where: { id } });
    return { deleted: true };
  }
}
