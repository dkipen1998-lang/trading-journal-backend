// backend file
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { TagsModule } from './tags/tags.module';
import { SetupsModule } from './setups/setups.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ImagesModule } from './images/images.module';
import { StatsModule } from './stats/stats.module';
import { ExportModule } from './export/export.module';
import { NewsModule } from './news/news.module';
import { AiModule } from './ai/ai.module';
import { MarketModule } from './market/market.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TradesModule,
    TagsModule,
    SetupsModule,
    ProfilesModule,
    ImagesModule,
    StatsModule,
    ExportModule,
    NewsModule,
    AiModule,
    MarketModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

