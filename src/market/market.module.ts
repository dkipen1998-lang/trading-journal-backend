// backend file
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [ConfigModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}

