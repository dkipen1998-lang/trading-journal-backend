import { Injectable, InternalServerErrorException } from '@nestjs/common';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

@Injectable()
export class MarketService {
  private get finnhubApiKey(): string {
    return process.env.FINNHUB_API_KEY?.trim() || '';
  }

  private async requestFinnhub(path: string): Promise<any> {
    if (!this.finnhubApiKey) {
      throw new InternalServerErrorException('Finnhub API key is not configured');
    }

    const url = `${FINNHUB_BASE}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.finnhubApiKey)}`;
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(`Finnhub request failed with ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch market data');
    }
  }

  async getQuote(symbol: string) {
    return this.requestFinnhub(`/quote?symbol=${encodeURIComponent(symbol)}`);
  }

  async getProfile(symbol: string) {
    return this.requestFinnhub(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
  }

  async getCandles(symbol: string, resolution: string, from: number, to: number) {
    return this.requestFinnhub(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}`);
  }
}
