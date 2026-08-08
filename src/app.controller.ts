import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get()
  root() {
    return { status: 'ok' };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
