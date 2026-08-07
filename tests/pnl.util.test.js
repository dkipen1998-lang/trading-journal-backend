const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadCalcPnl() {
  const sourcePath = path.resolve(__dirname, '../src/trades/pnl.util.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const module = { exports: {} };
  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(require, module, module.exports);
  return module.exports.calcPnl;
}

const calcPnl = loadCalcPnl();

test('calculates long PnL correctly for a closed trade', () => {
  const result = calcPnl({
    side: 'long',
    entryPrice: 100,
    positionSize: 2,
    stopLoss: 95,
    exitPrice: 110,
  });

  assert.equal(result.pnl, 20);
  assert.equal(result.pnlPercent, 10);
  assert.equal(result.rMultiple, 2);
});

test('supports short side and keeps the sign correct', () => {
  const result = calcPnl({
    side: 'short',
    entryPrice: 100,
    positionSize: 2,
    stopLoss: 105,
    exitPrice: 90,
  });

  assert.equal(result.pnl, 20);
  assert.equal(result.pnlPercent, 10);
  assert.equal(result.rMultiple, 2);
});

test('defaults missing side to long so close calculations stay consistent', () => {
  const result = calcPnl({
    side: undefined,
    entryPrice: 100,
    positionSize: 2,
    stopLoss: 95,
    exitPrice: 110,
  });

  assert.equal(result.pnl, 20);
  assert.equal(result.pnlPercent, 10);
});
