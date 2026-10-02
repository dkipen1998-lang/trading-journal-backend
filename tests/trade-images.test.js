const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadTradesService() {
  const sourcePath = path.resolve(__dirname, '../src/trades/trades.service.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      experimentalDecorators: true,
    },
  });

  const module = { exports: {} };
  const stubRequire = (id) => {
    if (id === '@nestjs/common') {
      return { Injectable: () => {}, NotFoundException: class NotFoundException extends Error {} };
    }
    if (id === '@prisma/client') {
      return { Prisma: {} };
    }
    if (id === '../prisma/prisma.service' || id === './prisma/prisma.service') {
      return { PrismaService: class PrismaService {} };
    }
    if (id === './pnl.util' || id === '../trades/pnl.util') {
      return { calcPnl: () => ({ pnl: 0, pnlPercent: 0, rMultiple: 0 }) };
    }
    return require(id);
  };

  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(stubRequire, module, module.exports);
  return module.exports;
}

const { TradesService } = loadTradesService();

test('trade shape exposes entry and exit screenshots from trade_images', () => {
  const service = new TradesService({});
  const result = service.shape({
    id: 'trade-1',
    ticker: 'BTCUSDT',
    tradeTags: [{ tag: { name: 'alpha' } }],
    images: [
      { imageType: 'entry', imageUrl: 'data:image/png;base64,entry' },
      { imageType: 'exit', imageUrl: 'data:image/png;base64,exit' },
    ],
  });

  assert.equal(result.entryScreenshot, 'data:image/png;base64,entry');
  assert.equal(result.exitScreenshot, 'data:image/png;base64,exit');
  assert.deepEqual(result.tags, ['alpha']);
});

test('updating one screenshot only replaces that image type', async () => {
  const operations = [];
  const service = new TradesService({
    tradeImage: {
      deleteMany: async ({ where }) => operations.push({ operation: 'delete', where }),
      create: async ({ data }) => operations.push({ operation: 'create', data }),
    },
  });

  await service.syncTradeScreenshots('trade-1', { exitScreenshot: 'data:image/png;base64,new-exit' });

  assert.deepEqual(operations, [
    { operation: 'delete', where: { tradeId: 'trade-1', imageType: 'exit' } },
    { operation: 'create', data: { tradeId: 'trade-1', imageType: 'exit', imageUrl: 'data:image/png;base64,new-exit' } },
  ]);
});

test('clearing one screenshot does not remove the other image type', async () => {
  const operations = [];
  const service = new TradesService({
    tradeImage: {
      deleteMany: async ({ where }) => operations.push({ operation: 'delete', where }),
      create: async ({ data }) => operations.push({ operation: 'create', data }),
    },
  });

  await service.syncTradeScreenshots('trade-1', { entryScreenshot: null });

  assert.deepEqual(operations, [
    { operation: 'delete', where: { tradeId: 'trade-1', imageType: 'entry' } },
  ]);
});
