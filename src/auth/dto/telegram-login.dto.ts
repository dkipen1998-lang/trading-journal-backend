// backend file
import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  @IsNotEmpty()
  initData: string;

  body?: { initData?: string };
  payload?: { initData?: string };
}

