// backend file
import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { ImagesService } from './images.service';

class PresignDto {
  @IsIn(['entry', 'exit'])
  imageType: 'entry' | 'exit';
}

class ConfirmImageDto {
  @IsIn(['entry', 'exit'])
  imageType: 'entry' | 'exit';

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}

@UseGuards(TelegramAuthGuard)
@Controller()
export class ImagesController {
  constructor(private images: ImagesService) {}

  @Post('trades/:id/images/presign')
  presign(@CurrentUserId() userId: string, @Param('id') tradeId: string, @Body() dto: PresignDto) {
    return this.images.presign(userId, tradeId, dto.imageType);
  }

  @Post('trades/:id/images')
  confirm(@CurrentUserId() userId: string, @Param('id') tradeId: string, @Body() dto: ConfirmImageDto) {
    return this.images.confirm(userId, tradeId, dto.imageType, dto.imageUrl);
  }

  @Delete('images/:id')
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.images.remove(userId, id);
  }
}

