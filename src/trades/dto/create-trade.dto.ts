// backend file
import { IsArray, IsIn, IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTradeDto {
  @IsString()
  ticker: string;

  @IsIn(['long', 'short'])
  side: 'long' | 'short';

  @IsISO8601()
  entryDate: string;

  @IsOptional()
  @IsString()
  entryTime?: string;

  @IsNumber()
  entryPrice: number;

  @IsOptional()
  @IsNumber()
  stopLoss?: number;

  @IsOptional()
  @IsNumber()
  takeProfit?: number;

  @IsOptional()
  @IsNumber()
  positionSize?: number;

  @IsOptional()
  @IsNumber()
  riskDollar?: number;

  @IsOptional()
  @IsNumber()
  riskPercent?: number;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  setup?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  entryScreenshot?: string;

  @IsOptional()
  @IsString()
  exitScreenshot?: string;

  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

