"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
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