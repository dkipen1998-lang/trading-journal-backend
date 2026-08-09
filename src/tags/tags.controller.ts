// backend file
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { TagsService } from './tags.service';

class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

@UseGuards(TelegramAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private tags: TagsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.tags.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateTagDto) {
    return this.tags.create(userId, dto.name);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.tags.remove(userId, id);
  }
}

