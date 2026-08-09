// backend file
import { PartialType } from '@nestjs/mapped-types';
import { CreateTradeDto } from './create-trade.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTradeDto extends PartialType(CreateTradeDto) {
  // Manual overrides: if the user typed these by hand, close/edit
  // recalculation is skipped and these values are kept as-is.
  @IsOptional()
  @IsNumber()
  pnl?: number;

  @IsOptional()
  @IsNumber()
  pnlPercent?: number;

  @IsOptional()
  @IsNumber()
  rMultiple?: number;

  @IsOptional()
  @IsString()
  postComment?: string;
}

