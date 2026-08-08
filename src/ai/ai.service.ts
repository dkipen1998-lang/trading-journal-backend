import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  private get openaiApiKey() {
    return this.configService.get<string>('OPENAI_API_KEY')?.trim() || '';
  }

  async chat(message: string) {
    const apiKey = this.openaiApiKey;
    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new InternalServerErrorException(`OpenAI request failed: ${response.status} ${responseText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return {
      text: typeof text === 'string' ? text.trim() : '',
    };
  }
}
