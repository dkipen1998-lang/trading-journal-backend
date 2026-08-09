"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pnl_util_1 = require("./pnl.util");
const TRADE_INCLUDE = {
    images: true,
    tradeTags: { include: { tag: true } },
};
let TradesService = class TradesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    shape(trade) {
        if (!trade)
            return trade;
        const { tradeTags, ...rest } = trade;
        return { ...rest, tags: (tradeTags ?? []).map((tt) => tt.tag.name) };
    }
    async list(userId, query) {
        const { status, side, result, setup, timeframe, tag, search, dateFrom, dateTo, page = 1, limit = 20 } = query;
        const where = { userId };
        if (status && status !== 'all')
            where.status = status;
        if (side && side !== 'all')
            where.side = side;
        if (result === 'profit')
            where.pnl = { gt: 0 };
        if (result === 'loss')
            where.pnl = { lt: 0 };
        if (setup)
            where.setup = setup;
        if (timeframe)
            where.timeframe = timeframe;
        if (tag)
            where.tradeTags = { some: { tag: { name: tag } } };
        if (search)
            where.ticker = { contains: search, mode: 'insensitive' };
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
    async findOne(userId, id) {
        const trade = await this.prisma.trade.findFirst({ where: { id, userId }, include: TRADE_INCLUDE });
        if (!trade)
            throw new common_1.NotFoundException('Trade not found');
        return this.shape(trade);
    }
    async ensureOwned(userId, id) {
        const trade = await this.prisma.trade.findFirst({ where: { id, userId } });
        if (!trade)
            throw new common_1.NotFoundException('Trade not found');
        return trade;
    }
    async syncTags(userId, tradeId, tagNames) {
        if (tagNames === undefined)
            return;
        // Ensure every tag exists for this user
        const tags = await Promise.all(tagNames.map((name) => this.prisma.tag.upsert({
            where: { userId_name: { userId, name } },
            update: {},
            create: { userId, name },
        })));
        await this.prisma.tradeTag.deleteMany({ where: { tradeId } });
        if (tags.length) {
            await this.prisma.tradeTag.createMany({
                data: tags.map((t) => ({ tradeId, tagId: t.id })),
            });
        }
    }
    async create(userId, dto) {
        const { tags, ...data } = dto;
        const trade = await this.prisma.trade.create({
            data: {
                userId,
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
    async update(userId, id, dto) {
        const existing = await this.ensureOwned(userId, id);
        const { tags, pnl, pnlPercent, rMultiple, ...rest } = dto;
        // Recalculate automatically unless the caller supplied manual override values
        const hasManualOverride = pnl !== undefined || pnlPercent !== undefined || rMultiple !== undefined;
        const merged = { ...existing, ...rest };
        const computed = hasManualOverride
            ? { pnl, pnlPercent, rMultiple }
            : (0, pnl_util_1.calcPnl)({
                side: merged.side,
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
    async close(userId, id, dto) {
        const existing = await this.ensureOwned(userId, id);
        const hasManualOverride = dto.pnl !== undefined || dto.pnlPercent !== undefined || dto.rMultiple !== undefined;
        const computed = hasManualOverride
            ? { pnl: dto.pnl, pnlPercent: dto.pnlPercent, rMultiple: dto.rMultiple }
            : (0, pnl_util_1.calcPnl)({
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
    async duplicate(userId, id) {
        const source = await this.ensureOwned(userId, id);
        const clone = await this.prisma.trade.create({
            data: {
                userId,
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
    async remove(userId, id) {
        await this.ensureOwned(userId, id);
        await this.prisma.trade.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.TradesService = TradesService;
exports.TradesService = TradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradesService);
//# sourceMappingURL=trades.service.js.map