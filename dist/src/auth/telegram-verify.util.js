"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTelegramInitData = verifyTelegramInitData;
exports.parseTelegramUser = parseTelegramUser;
const crypto = require("crypto");
function verifyTelegramInitData(initData, botToken) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash)
        return false;
    params.delete('hash');
    const dataCheckString = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return computedHash === hash;
}
function parseTelegramUser(initData) {
    const params = new URLSearchParams(initData);
    const raw = params.get('user');
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=telegram-verify.util.js.map