// backend file
import { Body, BadRequestException, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatAiDto } from './dto/chat-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatAiDto) {
    const message = dto.message?.trim?.();
    if (!message) {
      throw new BadRequestException('Message is required');
    }

    return this.aiService.chat(message, dto.provider);
  }
}

