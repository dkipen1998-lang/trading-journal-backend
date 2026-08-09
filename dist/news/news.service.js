"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const SEC_EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
let NewsService = class NewsService {
    get finnhubApiKey() {
        return process.env.FINNHUB_API_KEY?.trim() || '';
    }
    async fetchLatestNews() {
        const sources = await Promise.allSettled([
            this.fetchFinnhubNews(),
            this.fetchSecEdgarFilings(),
        ]);
        const items = [];
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        for (const source of sources) {
            if (source.status === 'fulfilled' && Array.isArray(source.value)) {
                items.push(...source.value);
            }
        }
        const activeItems = items
            .filter((item) => typeof item.publishedAt === 'number' && item.publishedAt >= cutoff)
            .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
            .slice(0, 20);
        return activeItems;
    }
    async fetchFinnhubNews() {
        if (!this.finnhubApiKey) {
            throw new Error('FINNHUB_API_KEY not configured');
        }
        const response = await fetch(`${FINNHUB_BASE}/news?category=general&token=${encodeURIComponent(this.finnhubApiKey)}`, {
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Finnhub news request failed with ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            return [];
        }
        return data
            .map((item) => {
            const publishedAt = item.datetime ? item.datetime * 1000 : null;
            const ticker = Array.isArray(item.symbols) ? item.symbols.join(', ') : item.symbol || undefined;
            const title = item.headline || item.summary || item.source || 'Finnhub news';
            const url = item.url || item.image || null;
            if (!title || !url)
                return null;
            return {
                title,
                url,
                source: 'Finnhub',
                ticker,
                publishedAt,
                type: 'news',
                summary: item.summary || undefined,
                bullishBearish: undefined,
                newsScore: undefined,
            };
        })
            .filter((item) => Boolean(item))
            .slice(0, 15);
    }
    async fetchSecEdgarFilings() {
        const body = {
            query: 'formType:(8-K OR 10-K OR 10-Q OR 6-K OR 13D OR 13G OR 4 OR 4-F)',
            from: 0,
            size: 10,
            sort: [{ filedAt: 'desc' }],
        };
        const response = await fetch(SEC_EDGAR_SEARCH, {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`SEC EDGAR request failed with ${response.status}`);
        }
        const data = await response.json();
        const hits = data?.hits?.hits || data?.result?.hits?.hits || [];
        if (!Array.isArray(hits)) {
            return [];
        }
        return hits
            .map((hit) => {
            const source = hit._source || hit;
            const filedAt = source.filedAt ? new Date(source.filedAt).getTime() : null;
            const ticker = source.symbol || source.ticker || undefined;
            const formType = source.formType || source.filingType || source.form_type || 'Filing';
            const companyName = source.companyName || source.company || source.name || '';
            const rawUrl = source.url || source.link || source.documentUrl || null;
            const url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://www.sec.gov${rawUrl}`) : null;
            if (!url)
                return null;
            return {
                title: `${formType} · ${companyName}`,
                url,
                source: 'SEC EDGAR',
                ticker: ticker?.toUpperCase(),
                publishedAt: filedAt,
                type: formType,
                summary: source.primaryDocDescription || source.description || companyName || undefined,
                bullishBearish: undefined,
                newsScore: undefined,
            };
        })
            .filter((item) => Boolean(item))
            .slice(0, 10);
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)()
], NewsService);
//# sourceMappingURL=news.service.js.map