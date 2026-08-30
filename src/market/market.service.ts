// backend file
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const BINANCE_BASE = 'https://fapi.binance.com';
const BINANCE_REQUEST_LIMIT_PER_MINUTE = 5;
const BINANCE_REQUEST_WINDOW_MS = 60_000;

@Injectable()
export class MarketService {
  private static binanceRequestTimestamps: number[] = [];

  static getNextBinanceRequestDelay(timestamps: number[] = MarketService.binanceRequestTimestamps, now: number = Date.now()): number {
    const recentTimestamps = timestamps.filter((ts) => ts > now - BINANCE_REQUEST_WINDOW_MS);
    if (recentTimestamps.length < BINANCE_REQUEST_LIMIT_PER_MINUTE) {
      return 0;
    }

    const oldest = recentTimestamps[0];
    return Math.max(0, BINANCE_REQUEST_WINDOW_MS - (now - oldest));
  }

  private static async waitForBinanceRequestSlot(): Promise<void> {
    while (true) {
      const now = Date.now();
      const recentTimestamps = MarketService.binanceRequestTimestamps.filter((ts) => ts > now - BINANCE_REQUEST_WINDOW_MS);
      const delay = MarketService.getNextBinanceRequestDelay(recentTimestamps, now);

      if (delay === 0) {
        recentTimestamps.push(now);
        MarketService.binanceRequestTimestamps = recentTimestamps;
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  private get finnhubApiKey(): string {
    return process.env.FINNHUB_API_KEY?.trim() || '';
  }

  private async requestFinnhub(path: string): Promise<any> {
    if (!this.finnhubApiKey) {
      throw new BadRequestException('Finnhub API key is not configured');
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
    } catch (error) {
      console.error('[market] Finnhub request failed:', error?.message || error);
      return null;
    }
  }

  private async requestBinance(path: string): Promise<any> {
    await MarketService.waitForBinanceRequestSlot();
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
    } catch (error) {
      console.error('[market] Binance request failed:', error?.message || error);
      return null;
    }
  }

  async getQuote(symbol: string) {
    const result = await this.requestFinnhub(`/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!result) {
      throw new BadRequestException(`Could not fetch quote for symbol ${symbol}`);
    }
    return result;
  }

  async getProfile(symbol: string) {
    const result = await this.requestFinnhub(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
    if (!result) {
      throw new BadRequestException(`Could not fetch profile for symbol ${symbol}`);
    }
    return result;
  }

  async getCandles(symbol: string, resolution: string, from: number, to: number) {
    // First try Finnhub
    const finnhubResult = await this.requestFinnhub(
      `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}`
    );
    if (finnhubResult && finnhubResult.s === 'ok' && Array.isArray(finnhubResult.t) && finnhubResult.t.length > 0) {
      return finnhubResult;
    }

    // If Finnhub fails, try Binance as fallback for crypto-like symbols
    const isCrypto = symbol.includes('USDT') || symbol.includes('USD') || /^(BTC|ETH|BNB|SOL|XRP)/i.test(symbol);
    if (isCrypto) {
      const pair = symbol.replace(/USD$/i, 'USDT');
      const interval = this.mapResolutionToBinanceInterval(resolution);
      const binanceResult = await this.requestBinance(
        `/fapi/v1/klines?symbol=${encodeURIComponent(pair)}&interval=${interval}&limit=100`
      );
      if (Array.isArray(binanceResult) && binanceResult.length > 0) {
        // Transform Binance format to match Finnhub format
        const t = binanceResult.map((item: any) => Math.floor(Number(item[0]) / 1000));
        const o = binanceResult.map((item: any) => item[1]);
        const h = binanceResult.map((item: any) => item[2]);
        const l = binanceResult.map((item: any) => item[3]);
        const c = binanceResult.map((item: any) => item[4]);
        const v = binanceResult.map((item: any) => item[7]);
        return { s: 'ok', t, o, h, l, c, v };
      }
    }

    throw new BadRequestException(`Could not fetch candles for symbol ${symbol} with resolution ${resolution}`);
  }

  private mapResolutionToBinanceInterval(resolution: string): string {
    const map: Record<string, string> = {
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
}

