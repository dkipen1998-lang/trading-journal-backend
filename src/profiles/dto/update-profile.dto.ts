// backend file
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  defaultRiskPerTrade?: number;

  @IsOptional()
  @IsNumber()
  accountSize?: number;

  @IsOptional()
  settings?: any;
}

