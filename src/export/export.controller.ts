import { Controller, Get, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CurrentUserId } from '../common/current-user.decorator';
import { ExportService } from './export.service';

@UseGuards(TelegramAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get()
  async export(@CurrentUserId() userId: string, @Query('format') format: string, @Res() res: Response) {
    if (format === 'csv') {
      const csv = await this.exportService.toCsv(userId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="trading-journal.csv"');
      return res.send(csv);
    }
    if (format === 'xlsx') {
      const buffer = await this.exportService.toXlsx(userId);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="trading-journal.xlsx"');
      return res.send(buffer);
    }
    if (format === 'pdf') {
      throw new BadRequestException('PDF export is not implemented yet — use csv or xlsx');
    }
    throw new BadRequestException('format must be csv, xlsx, or pdf');
  }
}
