import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(TelegramAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profiles: ProfilesService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.profiles.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateProfileDto) {
    return this.profiles.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profiles.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.profiles.remove(userId, id);
  }
}
