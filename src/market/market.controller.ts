// backend file
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('quote')
  async quote(@Query('symbol') symbol: string) {
    if (!symbol || typeof symbol !== 'string') {
      throw new BadRequestException('Symbol is required');
    }
    return this.marketService.getQuote(symbol.trim().toUpperCase());
  }

  @Get('profile')
  async profile(@Query('symbol') symbol: string) {
    if (!symbol || typeof symbol !== 'string') {
      throw new BadRequestException('Symbol is required');
    }
    return this.marketService.getProfile(symbol.trim().toUpperCase());
  }

  @Get('candles')
  async candles(
    @Query('symbol') symbol: string,
    @Query('resolution') resolution: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!symbol || !resolution || !from || !to) {
      throw new BadRequestException('Symbol, resolution, from and to are required');
    }
    const fromTs = Number(from);
    const toTs = Number(to);
    if (!Number.isFinite(fromTs) || !Number.isFinite(toTs) || fromTs <= 0 || toTs <= 0) {
      throw new BadRequestException('Invalid from/to timestamps');
    }
    return this.marketService.getCandles(symbol.trim().toUpperCase(), resolution, fromTs, toTs);
  }
}

