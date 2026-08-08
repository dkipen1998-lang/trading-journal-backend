const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadModule(relativePath) {
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      esModuleInterop: true,
    },
  });

  const module = { exports: {} };
  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(require, module, module.exports);
  return module.exports;
}

test('auth controller rejects missing initData with a bad-request error', () => {
  const { AuthController } = loadModule('src/auth/auth.controller.ts');
  const controller = new AuthController({
    loginWithTelegram: async () => ({ ok: true }),
  });

  assert.throws(
    () => controller.login({}),
    (error) => {
      return error?.name === 'BadRequestException' && /initData is required/i.test(error.message);
    },
    'Expected BadRequestException for missing initData',
  );
});
