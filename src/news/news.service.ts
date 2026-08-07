import { Injectable, InternalServerErrorException } from '@nestjs/common';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const SEC_EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

@Injectable()
export class NewsService {
  private get finnhubApiKey() {
    return process.env.FINNHUB_API_KEY?.trim() || '';
  }

  async fetchLatestNews() {
    const sources = await Promise.allSettled([
      this.fetchFinnhubNews(),
      this.fetchSecEdgarFilings(),
    ]);

    const items: Array<Record<string, any>> = [];

    for (const source of sources) {
      if (source.status === 'fulfilled' && Array.isArray(source.value)) {
        items.push(...source.value);
      }
    }

    return items
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, 20);
  }

  private async fetchFinnhubNews() {
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
      .map((item: any) => {
        const publishedAt = item.datetime ? item.datetime * 1000 : null;
        const ticker = Array.isArray(item.symbols) ? item.symbols.join(', ') : item.symbol || undefined;
        const title = item.headline || item.summary || item.source || 'Finnhub news';
        const url = item.url || item.image || null;
        if (!title || !url) return null;
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
      .filter(Boolean)
      .slice(0, 15);
  }

  private async fetchSecEdgarFilings() {
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
      .map((hit: any) => {
        const source = hit._source || hit;
        const filedAt = source.filedAt ? new Date(source.filedAt).getTime() : null;
        const ticker = source.symbol || source.ticker || undefined;
        const formType = source.formType || source.filingType || source.form_type || 'Filing';
        const companyName = source.companyName || source.company || source.name || '';
        const rawUrl = source.url || source.link || source.documentUrl || null;
        const url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://www.sec.gov${rawUrl}`) : null;
        if (!url) return null;
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
      .filter(Boolean)
      .slice(0, 10);
  }

  private async fetchYahooFallbackNews() {
    try {
      const response = await fetch('https://finance.yahoo.com/topic/latest-news/', {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      if (!response.ok) {
        throw new Error(`Yahoo request failed with ${response.status}`);
      }

      const html = await response.text();
      const normalized = html.replace(/\n/g, ' ');
      const items: Array<{ title: string; url: string }> = [];
      const seen = new Set<string>();
      const matcher = /<a[^>]+href="([^"]+)"[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>/gi;
      let match;
      while ((match = matcher.exec(normalized)) !== null && items.length < 20) {
        const rawUrl = match[1];
        const titleHtml = match[2];
        const title = titleHtml.replace(/<[^>]+>/g, '').trim();
        if (!title) continue;
        let url = rawUrl;
        if (url.startsWith('/')) {
          url = `https://finance.yahoo.com${url}`;
        }
        if (!url.startsWith('http')) continue;
        if (seen.has(url)) continue;
        seen.add(url);
        items.push({ title, url });
      }

      return items.slice(0, 10).map((item) => ({
        ...item,
        source: 'Yahoo Finance',
        type: 'news',
        publishedAt: null,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to load latest news from any source');
    }
  }
}
