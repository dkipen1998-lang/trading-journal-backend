"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
let MarketService = class MarketService {
    get finnhubApiKey() {
        return process.env.FINNHUB_API_KEY?.trim() || '';
    }
    async requestFinnhub(path) {
        if (!this.finnhubApiKey) {
            throw new common_1.InternalServerErrorException('Finnhub API key is not configured');
        }
        const url = `${FINNHUB_BASE}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.finnhubApiKey)}`;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new common_1.InternalServerErrorException(`Finnhub request failed with ${response.status}`);
            }
            return response.json();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch market data');
        }
    }
    async getQuote(symbol) {
        return this.requestFinnhub(`/quote?symbol=${encodeURIComponent(symbol)}`);
    }
    async getProfile(symbol) {
        return this.requestFinnhub(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
    }
    async getCandles(symbol, resolution, from, to) {
        return this.requestFinnhub(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}`);
    }
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = __decorate([
    (0, common_1.Injectable)()
], MarketService);
//# sourceMappingURL=market.service.js.map