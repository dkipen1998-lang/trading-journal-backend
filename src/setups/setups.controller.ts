// backend file
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { SetupsService } from './setups.service';

class CreateSetupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

@UseGuards(TelegramAuthGuard)
@Controller('setups')
export class SetupsController {
  constructor(private setups: SetupsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.setups.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateSetupDto) {
    return this.setups.create(userId, dto.name);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.setups.remove(userId, id);
  }
}

