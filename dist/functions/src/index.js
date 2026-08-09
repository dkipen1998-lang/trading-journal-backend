"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const express_1 = require("express");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../../src/app.module");
let cachedServer;
async function createNestServer() {
    if (cachedServer) {
        return cachedServer;
    }
    const server = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), {
        cors: true,
    });
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    await app.init();
    cachedServer = server;
    return cachedServer;
}
exports.api = functions.https.onRequest(async (req, res) => {
    const server = await createNestServer();
    server(req, res);
});
//# sourceMappingURL=index.js.map