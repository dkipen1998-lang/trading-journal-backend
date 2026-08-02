import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { TagsModule } from './tags/tags.module';
import { SetupsModule } from './setups/setups.module';
import { ImagesModule } from './images/images.module';
import { StatsModule } from './stats/stats.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TradesModule,
    TagsModule,
    SetupsModule,
    ImagesModule,
    StatsModule,
    ExportModule,
  ],
})
export class AppModule {}
