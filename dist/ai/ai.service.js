"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AiService = class AiService {
    constructor(configService) {
        this.configService = configService;
    }
    get aiProvider() {
        return this.configService.get('AI_PROVIDER')?.trim().toLowerCase() || 'openai';
    }
    get openaiApiKey() {
        return this.configService.get('OPENAI_API_KEY')?.trim() || '';
    }
    get geminiApiKey() {
        return this.configService.get('GEMINI_API_KEY')?.trim() || '';
    }
    get geminiModel() {
        return this.configService.get('GEMINI_MODEL')?.trim() || 'gemini-1.5';
    }
    get geminiEndpoint() {
        const configured = this.configService.get('GEMINI_ENDPOINT')?.trim();
        if (configured) {
            return configured.replace(/\/$/, '');
        }
        const model = this.geminiModel.toLowerCase();
        if (model.startsWith('gemini-')) {
            return 'https://gemini.googleapis.com';
        }
        return 'https://generativelanguage.googleapis.com';
    }
    getApiKey(provider) {
        return provider === 'gemini' ? this.geminiApiKey : this.openaiApiKey;
    }
    async chat(message, provider) {
        const aiProvider = provider?.trim()?.toLowerCase() || this.aiProvider;
        const apiKey = this.getApiKey(aiProvider);
        if (!apiKey) {
            const missingKey = aiProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
            throw new common_1.InternalServerErrorException(`${missingKey} is not configured`);
        }
        if (aiProvider === 'gemini') {
            return this.geminiChat(message, apiKey);
        }
        return this.openaiChat(message, apiKey);
    }
    async openaiChat(message, apiKey) {
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
            throw new common_1.InternalServerErrorException(`OpenAI request failed: ${response.status} ${responseText}`);
        }
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        return {
            text: typeof text === 'string' ? text.trim() : '',
        };
    }
    async geminiChat(message, apiKey) {
        const model = this.geminiModel;
        const endpoint = this.geminiEndpoint;
        const urlBase = `${endpoint}/v1/models/${encodeURIComponent(model)}:generateText`;
        const headers = {
            'Content-Type': 'application/json',
        };
        let url = urlBase;
        if (apiKey.startsWith('AIza')) {
            url = `${urlBase}?key=${encodeURIComponent(apiKey)}`;
        }
        else {
            headers.Authorization = `Bearer ${apiKey}`;
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                prompt: {
                    text: message,
                },
                temperature: 0.7,
                maxOutputTokens: 500,
            }),
        });
        if (!response.ok) {
            const responseText = await response.text();
            throw new common_1.InternalServerErrorException(`Gemini request failed: ${response.status} ${responseText}`);
        }
        const data = await response.json();
        const text = data?.candidates?.[0]?.output || data?.candidates?.[0]?.content || '';
        return {
            text: typeof text === 'string' ? text.trim() : '',
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map