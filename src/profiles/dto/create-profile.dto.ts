import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  defaultRiskPerTrade?: number;

  @IsOptional()
  @IsNumber()
  accountSize?: number;

  @IsOptional()
  settings?: any;
}
