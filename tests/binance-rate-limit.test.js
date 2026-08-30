const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadMarketService() {
  const sourcePath = path.resolve(__dirname, '../src/market/market.service.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const module = { exports: {} };
  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(require, module, module.exports);
  return module.exports;
}

const { MarketService } = loadMarketService();

test('Binance requests are rate-limited to five per minute', () => {
  const timestamps = [1000, 2000, 3000, 4000, 5000];
  const delay = MarketService.getNextBinanceRequestDelay(timestamps, 60_000);

  assert.equal(delay, 1000);
});
