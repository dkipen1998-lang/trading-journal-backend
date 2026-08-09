import { IsIn, IsOptional, IsString } from 'class-validator';

export class ChatAiDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @IsIn(['openai', 'gemini'])
  provider?: string;
}
