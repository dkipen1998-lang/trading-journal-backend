import { Body, BadRequestException, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('Message is required');
    }

    return this.aiService.chat(message.trim());
  }
}
