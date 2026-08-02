import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private async closedTrades(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { userId, status: 'closed' },
      orderBy: { exitDate: 'asc' },
    });
    return trades.map((t) => ({
      ...t,
      pnl: t.pnl != null ? Number(t.pnl) : 0,
      pnlPercent: t.pnlPercent != null ? Number(t.pnlPercent) : 0,
      rMultiple: t.rMultiple != null ? Number(t.rMultiple) : null,
    }));
  }

  async summary(userId: string) {
    const trades = await this.closedTrades(userId);
    const tradeCount = trades.length;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);

    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const totalPnlPercent = trades.reduce((s, t) => s + t.pnlPercent, 0);
    const winRate = tradeCount ? (wins.length / tradeCount) * 100 : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectancy = tradeCount ? totalPnl / tradeCount : 0;
    const rValues = trades.filter((t) => t.rMultiple != null).map((t) => t.rMultiple as number);
    const avgR = rValues.length ? rValues.reduce((s, r) => s + r, 0) / rValues.length : 0;

    const bestTrade = trades.reduce((best, t) => (best == null || t.pnl > best.pnl ? t : best), null as any);
    const worstTrade = trades.reduce((worst, t) => (worst == null || t.pnl < worst.pnl ? t : worst), null as any);

    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let curWin = 0;
    let curLoss = 0;
    for (const t of trades) {
      if (t.pnl > 0) {
        curWin += 1;
        curLoss = 0;
      } else if (t.pnl < 0) {
        curLoss += 1;
        curWin = 0;
      } else {
        curWin = 0;
        curLoss = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, curWin);
      maxLossStreak = Math.max(maxLossStreak, curLoss);
    }

    return {
      totalPnl: +totalPnl.toFixed(2),
      totalPnlPercent: +totalPnlPercent.toFixed(2),
      winRate: +winRate.toFixed(2),
      tradeCount,
      longCount: trades.filter((t) => t.side === 'long').length,
      shortCount: trades.filter((t) => t.side === 'short').length,
      avgWin: +avgWin.toFixed(2),
      avgLoss: +avgLoss.toFixed(2),
      profitFactor: Number.isFinite(profitFactor) ? +profitFactor.toFixed(2) : null,
      expectancy: +expectancy.toFixed(2),
      avgR: +avgR.toFixed(2),
      bestTrade: bestTrade ? { id: bestTrade.id, ticker: bestTrade.ticker, pnl: bestTrade.pnl } : null,
      worstTrade: worstTrade ? { id: worstTrade.id, ticker: worstTrade.ticker, pnl: worstTrade.pnl } : null,
      maxWinStreak,
      maxLossStreak,
    };
  }

  async equityCurve(userId: string) {
    const trades = await this.closedTrades(userId);
    let cumulative = 0;
    return trades.map((t) => {
      cumulative += t.pnl;
      return { tradeId: t.id, exitDate: t.exitDate, pnl: t.pnl, cumulativePnl: +cumulative.toFixed(2) };
    });
  }

  async byDay(userId: string) {
    const trades = await this.closedTrades(userId);
    const map = new Map<string, number>();
    for (const t of trades) {
      if (!t.exitDate) continue;
      const key = t.exitDate.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + t.pnl);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => ({ date, pnl: +pnl.toFixed(2) }));
  }

  async byMonth(userId: string) {
    const trades = await this.closedTrades(userId);
    const map = new Map<string, { pnl: number; wins: number; total: number }>();
    for (const t of trades) {
      if (!t.exitDate) continue;
      const key = t.exitDate.toISOString().slice(0, 7); // YYYY-MM
      const entry = map.get(key) ?? { pnl: 0, wins: 0, total: 0 };
      entry.pnl += t.pnl;
      entry.total += 1;
      if (t.pnl > 0) entry.wins += 1;
      map.set(key, entry);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        pnl: +v.pnl.toFixed(2),
        winRate: v.total ? +((v.wins / v.total) * 100).toFixed(2) : 0,
      }));
  }
}
