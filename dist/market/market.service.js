"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MarketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const BINANCE_BASE = 'https://fapi.binance.com';
const BINANCE_REQUEST_LIMIT_PER_MINUTE = 5;
const BINANCE_REQUEST_WINDOW_MS = 60_000;
let MarketService = MarketService_1 = class MarketService {
    static getNextBinanceRequestDelay(timestamps = MarketService_1.binanceRequestTimestamps, now = Date.now()) {
        const recentTimestamps = timestamps.filter((ts) => ts > now - BINANCE_REQUEST_WINDOW_MS);
        if (recentTimestamps.length < BINANCE_REQUEST_LIMIT_PER_MINUTE) {
            return 0;
        }
        const oldest = recentTimestamps[0];
        return Math.max(0, BINANCE_REQUEST_WINDOW_MS - (now - oldest));
    }
    static async waitForBinanceRequestSlot() {
        while (true) {
            const now = Date.now();
            const recentTimestamps = MarketService_1.binanceRequestTimestamps.filter((ts) => ts > now - BINANCE_REQUEST_WINDOW_MS);
            const delay = MarketService_1.getNextBinanceRequestDelay(recentTimestamps, now);
            if (delay === 0) {
                recentTimestamps.push(now);
                MarketService_1.binanceRequestTimestamps = recentTimestamps;
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    get finnhubApiKey() {
        return process.env.FINNHUB_API_KEY?.trim() || '';
    }
    async requestFinnhub(path) {
        if (!this.finnhubApiKey) {
            throw new common_1.BadRequestException('Finnhub API key is not configured');
        }
        const url = `${FINNHUB_BASE}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.finnhubApiKey)}`;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                console.warn(`[market] Finnhub API error: ${response.status} for path ${path}`);
                return null;
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('[market] Finnhub request failed:', error?.message || error);
            return null;
        }
    }
    async requestBinance(path) {
        await MarketService_1.waitForBinanceRequestSlot();
        const url = `${BINANCE_BASE}${path}`;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                console.warn(`[market] Binance API error: ${response.status} for path ${path}`);
                return null;
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('[market] Binance request failed:', error?.message || error);
            return null;
        }
    }
    async getQuote(symbol) {
        const result = await this.requestFinnhub(`/quote?symbol=${encodeURIComponent(symbol)}`);
        if (!result) {
            throw new common_1.BadRequestException(`Could not fetch quote for symbol ${symbol}`);
        }
        return result;
    }
    async getProfile(symbol) {
        const result = await this.requestFinnhub(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
        if (!result) {
            throw new common_1.BadRequestException(`Could not fetch profile for symbol ${symbol}`);
        }
        return result;
    }
    async getCandles(symbol, resolution, from, to) {
        const finnhubResult = await this.requestFinnhub(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}`);
        if (finnhubResult && finnhubResult.s === 'ok' && Array.isArray(finnhubResult.t) && finnhubResult.t.length > 0) {
            return finnhubResult;
        }
        const isCrypto = symbol.includes('USDT') || symbol.includes('USD') || /^(BTC|ETH|BNB|SOL|XRP)/i.test(symbol);
        if (isCrypto) {
            const pair = symbol.replace(/USD$/i, 'USDT');
            const interval = this.mapResolutionToBinanceInterval(resolution);
            const binanceResult = await this.requestBinance(`/fapi/v1/klines?symbol=${encodeURIComponent(pair)}&interval=${interval}&limit=100`);
            if (Array.isArray(binanceResult) && binanceResult.length > 0) {
                const t = binanceResult.map((item) => Math.floor(Number(item[0]) / 1000));
                const o = binanceResult.map((item) => item[1]);
                const h = binanceResult.map((item) => item[2]);
                const l = binanceResult.map((item) => item[3]);
                const c = binanceResult.map((item) => item[4]);
                const v = binanceResult.map((item) => item[7]);
                return { s: 'ok', t, o, h, l, c, v };
            }
        }
        throw new common_1.BadRequestException(`Could not fetch candles for symbol ${symbol} with resolution ${resolution}`);
    }
    mapResolutionToBinanceInterval(resolution) {
        const map = {
            '1': '1m',
            '5': '5m',
            '15': '15m',
            '30': '30m',
            '60': '1h',
            '240': '4h',
            'D': '1d',
            'W': '1w',
            'M': '1M',
        };
        return map[resolution] || '1h';
    }
};
exports.MarketService = MarketService;
MarketService.binanceRequestTimestamps = [];
exports.MarketService = MarketService = MarketService_1 = __decorate([
    (0, common_1.Injectable)()
], MarketService);
//# sourceMappingURL=market.service.js.map