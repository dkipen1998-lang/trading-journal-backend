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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("./market.service");
let MarketController = class MarketController {
    constructor(marketService) {
        this.marketService = marketService;
    }
    async quote(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            throw new common_1.BadRequestException('Symbol is required');
        }
        return this.marketService.getQuote(symbol.trim().toUpperCase());
    }
    async profile(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            throw new common_1.BadRequestException('Symbol is required');
        }
        return this.marketService.getProfile(symbol.trim().toUpperCase());
    }
    async candles(symbol, resolution, from, to) {
        if (!symbol || !resolution || !from || !to) {
            throw new common_1.BadRequestException('Symbol, resolution, from and to are required');
        }
        const fromTs = Number(from);
        const toTs = Number(to);
        if (!Number.isFinite(fromTs) || !Number.isFinite(toTs) || fromTs <= 0 || toTs <= 0) {
            throw new common_1.BadRequestException('Invalid from/to timestamps');
        }
        return this.marketService.getCandles(symbol.trim().toUpperCase(), resolution, fromTs, toTs);
    }
};
exports.MarketController = MarketController;
__decorate([
    (0, common_1.Get)('quote'),
    __param(0, (0, common_1.Query)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "quote", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Query)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "profile", null);
__decorate([
    (0, common_1.Get)('candles'),
    __param(0, (0, common_1.Query)('symbol')),
    __param(1, (0, common_1.Query)('resolution')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "candles", null);
exports.MarketController = MarketController = __decorate([
    (0, common_1.Controller)('market'),
    __metadata("design:paramtypes", [market_service_1.MarketService])
], MarketController);
//# sourceMappingURL=market.controller.js.map