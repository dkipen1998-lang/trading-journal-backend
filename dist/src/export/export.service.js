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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
const prisma_service_1 = require("../prisma/prisma.service");
let ExportService = class ExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async rows(userId) {
        const trades = await this.prisma.trade.findMany({
            where: { userId },
            include: { tradeTags: { include: { tag: true } } },
            orderBy: { entryDate: 'desc' },
        });
        return trades.map((t) => ({
            Ticker: t.ticker,
            Side: t.side,
            Status: t.status,
            EntryDate: t.entryDate?.toISOString().slice(0, 10),
            EntryTime: t.entryTime,
            EntryPrice: t.entryPrice,
            StopLoss: t.stopLoss,
            TakeProfit: t.takeProfit,
            PositionSize: t.positionSize,
            RiskDollar: t.riskDollar,
            RiskPercent: t.riskPercent,
            Timeframe: t.timeframe,
            Setup: t.setup,
            Tags: t.tradeTags.map((tt) => tt.tag.name).join('|'),
            ExitDate: t.exitDate?.toISOString().slice(0, 10),
            ExitTime: t.exitTime,
            ExitPrice: t.exitPrice,
            ExitReason: t.exitReason,
            PnL: t.pnl,
            PnLPercent: t.pnlPercent,
            RMultiple: t.rMultiple,
            Notes: t.notes,
            PostComment: t.postComment,
        }));
    }
    async toCsv(userId) {
        const rows = await this.rows(userId);
        const ws = XLSX.utils.json_to_sheet(rows);
        return XLSX.utils.sheet_to_csv(ws);
    }
    async toXlsx(userId) {
        const rows = await this.rows(userId);
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Trades');
        return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map