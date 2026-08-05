import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator';

export class QueryTradesDto {
  @IsOptional()
  @IsIn(['all', 'open', 'closed'])
  status?: 'all' | 'open' | 'closed' = 'all';

  @IsOptional()
  @IsIn(['all', 'long', 'short'])
  side?: 'all' | 'long' | 'short' = 'all';

  @IsOptional()
  @IsIn(['all', 'profit', 'loss'])
  result?: 'all' | 'profit' | 'loss' = 'all';

  @IsOptional()
  @IsString()
  setup?: string;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
