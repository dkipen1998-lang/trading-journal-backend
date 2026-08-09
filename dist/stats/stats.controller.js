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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const telegram_auth_guard_1 = require("../auth/telegram-auth.guard");
const current_user_decorator_1 = require("../common/current-user.decorator");
const stats_service_1 = require("./stats.service");
let StatsController = class StatsController {
    constructor(stats) {
        this.stats = stats;
    }
    summary(userId) {
        return this.stats.summary(userId);
    }
    equityCurve(userId) {
        return this.stats.equityCurve(userId);
    }
    byDay(userId) {
        return this.stats.byDay(userId);
    }
    byMonth(userId) {
        return this.stats.byMonth(userId);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('equity-curve'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "equityCurve", null);
__decorate([
    (0, common_1.Get)('by-day'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "byDay", null);
__decorate([
    (0, common_1.Get)('by-month'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "byMonth", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.UseGuards)(telegram_auth_guard_1.TelegramAuthGuard),
    (0, common_1.Controller)('stats'),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map