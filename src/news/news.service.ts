import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class NewsService {
  async fetchLatestNews() {
    try {
      const response = await fetch('https://finance.yahoo.com/topic/latest-news/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      if (!response.ok) {
        throw new Error(`Yahoo request failed with ${response.status}`);
      }
      const html = await response.text();
      const normalized = html.replace(/\n/g, ' ');
      const items = [] as { title: string; url: string }[];
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
      return items.slice(0, 10);
    } catch (error) {
      throw new InternalServerErrorException('Failed to load latest news from Yahoo Finance');
    }
  }
}
