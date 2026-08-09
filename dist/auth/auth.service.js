"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const telegram_verify_util_1 = require("./telegram-verify.util");
let AuthService = class AuthService {
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async loginWithTelegram(initData) {
        const botToken = this.config.get('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new common_1.UnauthorizedException('Server is missing TELEGRAM_BOT_TOKEN');
        }
        const isValid = (0, telegram_verify_util_1.verifyTelegramInitData)(initData, botToken);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Telegram initData signature');
        }
        const tgUser = (0, telegram_verify_util_1.parseTelegramUser)(initData);
        if (!tgUser) {
            throw new common_1.UnauthorizedException('initData is missing user info');
        }
        const user = await this.users.upsertFromTelegram(tgUser);
        const token = await this.jwt.signAsync({ sub: user.id });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                photoUrl: user.photoUrl,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map