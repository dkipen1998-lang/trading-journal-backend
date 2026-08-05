import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.profile.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  create(userId: string, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: {
        userId,
        name: dto.name,
        defaultRiskPerTrade: dto.defaultRiskPerTrade ?? undefined,
        accountSize: dto.accountSize ?? undefined,
        settings: dto.settings,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        defaultRiskPerTrade: dto.defaultRiskPerTrade ?? undefined,
        accountSize: dto.accountSize ?? undefined,
        settings: dto.settings ?? undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.profile.delete({ where: { id } });
    return { deleted: true };
  }
}
