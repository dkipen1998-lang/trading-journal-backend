import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns a pre-signed upload target. Wire this up to real S3/Cloudinary
   * SDK calls when you have credentials (see S3_* vars in .env.example) —
   * this stub returns a deterministic placeholder so the endpoint contract
   * from the design doc works end-to-end during local development.
   */
  async presign(userId: string, tradeId: string, imageType: 'entry' | 'exit') {
    const key = `${userId}/${tradeId}/${imageType}-${crypto.randomUUID()}`;
    return {
      uploadUrl: `https://YOUR_BUCKET.s3.amazonaws.com/${key}?PLACEHOLDER_SIGNATURE`,
      publicUrl: `https://YOUR_BUCKET.s3.amazonaws.com/${key}`,
      key,
    };
  }

  async confirm(userId: string, tradeId: string, imageType: 'entry' | 'exit', imageUrl: string) {
    const trade = await this.prisma.trade.findFirst({ where: { id: tradeId, userId } });
    if (!trade) throw new NotFoundException('Trade not found');

    return this.prisma.tradeImage.create({
      data: { tradeId, imageType, imageUrl },
    });
  }

  async remove(userId: string, imageId: string) {
    const image = await this.prisma.tradeImage.findFirst({
      where: { id: imageId, trade: { userId } },
    });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.tradeImage.delete({ where: { id: imageId } });
    return { deleted: true };
  }
}
