import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { QueryTradesDto } from './dto/query-trades.dto';

@UseGuards(TelegramAuthGuard)
@Controller('trades')
export class TradesController {
  constructor(private trades: TradesService) {}

  @Get()
  list(@CurrentUserId() userId: string, @Query() query: QueryTradesDto) {
    return this.trades.list(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.trades.findOne(userId, id);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateTradeDto) {
    return this.trades.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateTradeDto) {
    return this.trades.update(userId, id, dto);
  }

  @Patch(':id/close')
  close(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: CloseTradeDto) {
    return this.trades.close(userId, id, dto);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.trades.duplicate(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.trades.remove(userId, id);
  }
}
