import { Controller, Get, UseGuards } from '@nestjs/common';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { StatsService } from './stats.service';

@UseGuards(TelegramAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('summary')
  summary(@CurrentUserId() userId: string) {
    return this.stats.summary(userId);
  }

  @Get('equity-curve')
  equityCurve(@CurrentUserId() userId: string) {
    return this.stats.equityCurve(userId);
  }

  @Get('by-day')
  byDay(@CurrentUserId() userId: string) {
    return this.stats.byDay(userId);
  }

  @Get('by-month')
  byMonth(@CurrentUserId() userId: string) {
    return this.stats.byMonth(userId);
  }
}
