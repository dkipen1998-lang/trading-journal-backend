// backend file
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  private get aiProvider() {
    return this.configService.get<string>('AI_PROVIDER')?.trim().toLowerCase() || 'openai';
  }

  private get openaiApiKey() {
    return this.configService.get<string>('OPENAI_API_KEY')?.trim() || '';
  }

  private get geminiApiKey() {
    return this.configService.get<string>('GEMINI_API_KEY')?.trim() || '';
  }

  private get geminiModel() {
    return this.configService.get<string>('GEMINI_MODEL')?.trim() || 'gemini-1.5-flash';
  }

  private getApiKey(provider: string) {
    return provider === 'gemini' ? this.geminiApiKey : this.openaiApiKey;
  }

  async chat(message: string, provider?: string) {
    const aiProvider = provider?.trim()?.toLowerCase() || this.aiProvider;
    const apiKey = this.getApiKey(aiProvider);

    if (!apiKey) {
      // Try to gracefully fall back to the other provider if its key is available
      const fallbackProvider = aiProvider === 'gemini' ? 'openai' : 'gemini';
      const fallbackKey = this.getApiKey(fallbackProvider);
      if (fallbackKey) {
        console.warn(`Requested provider '${aiProvider}' missing API key; falling back to '${fallbackProvider}'.`);
        // switch provider and apiKey to fallback
        if (fallbackProvider === 'gemini') {
          return this.geminiChat(message, fallbackKey);
        }
        return this.openaiChat(message, fallbackKey);
      }

      const missingKey = aiProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
      // Missing both keys — return a clear client error instead of generic 500
      throw new BadRequestException(`${missingKey} is not configured`);
    }

    if (aiProvider === 'gemini') {
      return this.geminiChat(message, apiKey);
    }

    return this.openaiChat(message, apiKey);
  }

  private async openaiChat(message: string, apiKey: string) {
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

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    } | undefined;

    const text = data?.choices?.[0]?.message?.content ?? '';
    return {
      text: typeof text === 'string' ? text.trim() : '',
    };
  }

  private async geminiChat(message: string, apiKey: string) {
    const model = this.geminiModel;
    const apiKeyIsGoogleApiKey = apiKey.startsWith('AIza');
    const configuredEndpoint = this.configService.get<string>('GEMINI_ENDPOINT')?.trim();
    const normalizedEndpoint = configuredEndpoint ? configuredEndpoint.replace(/\/$/, '') : '';
    const endpoint = normalizedEndpoint || 'https://generativelanguage.googleapis.com';
    const requestUrlBase = `${endpoint}/v1beta/models/${encodeURIComponent(model)}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
      contents: [{
        parts: [{ text: message }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const requests = [
      {
        url: apiKeyIsGoogleApiKey ? `${requestUrlBase}:generateContent?key=${encodeURIComponent(apiKey)}` : `${requestUrlBase}:generateContent`,
        headers: apiKeyIsGoogleApiKey ? headers : { ...headers, Authorization: `Bearer ${apiKey}` },
        body,
      },
    ];

    let lastError: { status: number; body: string } | null = null;
    for (const request of requests) {
      const response = await fetch(request.url, {
        method: 'POST',
        headers: request.headers,
        body: request.body,
      });

      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: Array<{
            output?: string | null;
            content?: { parts?: Array<{ text?: string | null }> | null } | null;
          }>;
        } | undefined;

        const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')
          || data?.candidates?.[0]?.output
          || '';

        return {
          text: typeof text === 'string' ? text.trim() : '',
        };
      }

      lastError = {
        status: response.status,
        body: await response.text(),
      };
    }

    if (lastError) {
      throw new InternalServerErrorException(`Gemini request failed: ${lastError.status} ${lastError.body}`);
    }

    throw new InternalServerErrorException('Gemini request failed');
  }
}

