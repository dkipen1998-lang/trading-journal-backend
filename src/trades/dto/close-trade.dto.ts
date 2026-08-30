// backend file
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class CloseTradeDto {
  @IsISO8601()
  exitDate: string;

  @IsOptional()
  @IsString()
  exitTime?: string;

  @IsNumber()
  exitPrice: number;

  @IsOptional()
  @IsString()
  exitReason?: string;

  @IsOptional()
  @IsString()
  postComment?: string;

  @IsOptional()
  @IsString()
  exitScreenshot?: string;

  // If the user typed these manually in the close form, respect them
  // instead of overwriting with the server-computed values.
  @IsOptional()
  @IsNumber()
  pnl?: number;

  @IsOptional()
  @IsNumber()
  pnlPercent?: number;

  @IsOptional()
  @IsNumber()
  rMultiple?: number;
}

