// backend file
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  private async rows(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { entryDate: 'desc' },
    });

    return trades.map((t) => ({
      Ticker: t.ticker,
      Side: t.side,
      Status: t.status,
      EntryDate: t.entryDate?.toISOString().slice(0, 10),
      EntryTime: t.entryTime,
      EntryPrice: t.entryPrice,
      StopLoss: t.stopLoss,
      TakeProfit: t.takeProfit,
      PositionSize: t.positionSize,
      RiskDollar: t.riskDollar,
      RiskPercent: t.riskPercent,
      Timeframe: t.timeframe,
      Setup: t.setup,
      Tags: t.tradeTags.map((tt) => tt.tag.name).join('|'),
      ExitDate: t.exitDate?.toISOString().slice(0, 10),
      ExitTime: t.exitTime,
      ExitPrice: t.exitPrice,
      ExitReason: t.exitReason,
      PnL: t.pnl,
      PnLPercent: t.pnlPercent,
      RMultiple: t.rMultiple,
      Notes: t.notes,
      PostComment: t.postComment,
    }));
  }

  async toCsv(userId: string): Promise<string> {
    const rows = await this.rows(userId);
    const ws = XLSX.utils.json_to_sheet(rows);
    return XLSX.utils.sheet_to_csv(ws);
  }

  async toXlsx(userId: string): Promise<Buffer> {
    const rows = await this.rows(userId);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }
}

