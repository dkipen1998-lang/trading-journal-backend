// backend file
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { QueryTradesDto } from './dto/query-trades.dto';
import { calcPnl } from './pnl.util';

const TRADE_INCLUDE = {
  images: true,
  tradeTags: { include: { tag: true } },
} satisfies Prisma.TradeInclude;

@Injectable()
export class TradesService {
  constructor(private prisma: PrismaService) {}

  private shape(trade: any) {
    if (!trade) return trade;
    const { tradeTags, ...rest } = trade;
    return { ...rest, tags: (tradeTags ?? []).map((tt: any) => tt.tag.name) };
  }

  async list(userId: string, query: QueryTradesDto) {
    const { status, side, result, setup, timeframe, profileId, tag, search, dateFrom, dateTo, page = 1, limit = 20 } = query;

    const where: Prisma.TradeWhereInput = { userId };

    if (status && status !== 'all') where.status = status;
    if (side && side !== 'all') where.side = side;
    if (result === 'profit') where.pnl = { gt: 0 };
    if (result === 'loss') where.pnl = { lt: 0 };
    if (setup) where.setup = setup;
    if (timeframe) where.timeframe = timeframe;
    if (profileId) where.profileId = profileId;
    if (tag) where.tradeTags = { some: { tag: { name: tag } } };
    if (search) where.ticker = { contains: search, mode: 'insensitive' };
    if (dateFrom || dateTo) {
      where.entryDate = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.trade.findMany({
        where,
        include: TRADE_INCLUDE,
        orderBy: { entryDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trade.count({ where }),
    ]);

    return {
      items: items.map((t) => this.shape(t)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(userId: string, id: string) {
    const trade = await this.prisma.trade.findFirst({ where: { id, userId }, include: TRADE_INCLUDE });
    if (!trade) throw new NotFoundException('Trade not found');
    return this.shape(trade);
  }

  private async ensureOwned(userId: string, id: string) {
    const trade = await this.prisma.trade.findFirst({ where: { id, userId } });
    if (!trade) throw new NotFoundException('Trade not found');
    return trade;
  }

  private async syncTags(userId: string, tradeId: string, tagNames: string[] | undefined) {
    if (tagNames === undefined) return;
    // Ensure every tag exists for this user
    const tags = await Promise.all(
      tagNames.map((name) =>
        this.prisma.tag.upsert({
          where: { userId_name: { userId, name } },
          update: {},
          create: { userId, name },
        }),
      ),
    );
    await this.prisma.tradeTag.deleteMany({ where: { tradeId } });
    if (tags.length) {
      await this.prisma.tradeTag.createMany({
        data: tags.map((t) => ({ tradeId, tagId: t.id })),
      });
    }
  }

  async create(userId: string, dto: CreateTradeDto) {
    const { tags, ...data } = dto;
    const trade = await this.prisma.trade.create({
      data: {
        userId,
        profileId: data.profileId,
        ticker: data.ticker,
        side: data.side,
        entryDate: new Date(data.entryDate),
        entryTime: data.entryTime,
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        positionSize: data.positionSize,
        riskDollar: data.riskDollar,
        riskPercent: data.riskPercent,
        timeframe: data.timeframe,
        setup: data.setup,
        notes: data.notes,
        status: 'open',
      },
    });
    await this.syncTags(userId, trade.id, tags);
    return this.findOne(userId, trade.id);
  }

  async update(userId: string, id: string, dto: UpdateTradeDto) {
    const existing = await this.ensureOwned(userId, id);
    const { tags, pnl, pnlPercent, rMultiple, ...rest } = dto;

    // Recalculate automatically unless the caller supplied manual override values
    const hasManualOverride = pnl !== undefined || pnlPercent !== undefined || rMultiple !== undefined;
    const merged = { ...existing, ...rest };
    const computed = hasManualOverride
      ? { pnl, pnlPercent, rMultiple }
      : calcPnl({
          side: merged.side as 'long' | 'short',
          entryPrice: Number(merged.entryPrice),
          positionSize: merged.positionSize != null ? Number(merged.positionSize) : null,
          stopLoss: merged.stopLoss != null ? Number(merged.stopLoss) : null,
          exitPrice: merged.exitPrice != null ? Number(merged.exitPrice) : null,
        });

    await this.prisma.trade.update({
      where: { id },
      data: {
        ...rest,
        entryDate: rest.entryDate ? new Date(rest.entryDate) : undefined,
        pnl: computed.pnl ?? undefined,
        pnlPercent: computed.pnlPercent ?? undefined,
        rMultiple: computed.rMultiple ?? undefined,
      },
    });

    await this.syncTags(userId, id, tags);
    return this.findOne(userId, id);
  }

  async close(userId: string, id: string, dto: CloseTradeDto) {
    const existing = await this.ensureOwned(userId, id);
    const hasManualOverride = dto.pnl !== undefined || dto.pnlPercent !== undefined || dto.rMultiple !== undefined;

    const computed = hasManualOverride
      ? { pnl: dto.pnl, pnlPercent: dto.pnlPercent, rMultiple: dto.rMultiple }
      : calcPnl({
          side: existing.side,
          entryPrice: Number(existing.entryPrice),
          positionSize: existing.positionSize != null ? Number(existing.positionSize) : null,
          stopLoss: existing.stopLoss != null ? Number(existing.stopLoss) : null,
          exitPrice: dto.exitPrice,
        });

    await this.prisma.trade.update({
      where: { id },
      data: {
        status: 'closed',
        exitDate: new Date(dto.exitDate),
        exitTime: dto.exitTime,
        exitPrice: dto.exitPrice,
        exitReason: dto.exitReason,
        postComment: dto.postComment,
        pnl: computed.pnl,
        pnlPercent: computed.pnlPercent,
        rMultiple: computed.rMultiple,
      },
    });

    return this.findOne(userId, id);
  }

  async duplicate(userId: string, id: string) {
    const source = await this.ensureOwned(userId, id);
    const clone = await this.prisma.trade.create({
      data: {
        userId,
        profileId: source.profileId,
        ticker: source.ticker,
        side: source.side,
        status: 'open',
        entryDate: new Date(),
        entryTime: source.entryTime,
        entryPrice: source.entryPrice,
        stopLoss: source.stopLoss,
        takeProfit: source.takeProfit,
        positionSize: source.positionSize,
        riskDollar: source.riskDollar,
        riskPercent: source.riskPercent,
        timeframe: source.timeframe,
        setup: source.setup,
        notes: source.notes,
      },
    });

    const tags = await this.prisma.tradeTag.findMany({ where: { tradeId: id }, include: { tag: true } });
    if (tags.length) {
      await this.prisma.tradeTag.createMany({
        data: tags.map((t) => ({ tradeId: clone.id, tagId: t.tagId })),
      });
    }

    return this.findOne(userId, clone.id);
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id);
    await this.prisma.trade.delete({ where: { id } });
    return { deleted: true };
  }
}

