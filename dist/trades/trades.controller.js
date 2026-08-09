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
exports.TradesController = void 0;
const common_1 = require("@nestjs/common");
const telegram_auth_guard_1 = require("../auth/telegram-auth.guard");
const current_user_decorator_1 = require("../common/current-user.decorator");
const trades_service_1 = require("./trades.service");
const create_trade_dto_1 = require("./dto/create-trade.dto");
const update_trade_dto_1 = require("./dto/update-trade.dto");
const close_trade_dto_1 = require("./dto/close-trade.dto");
const query_trades_dto_1 = require("./dto/query-trades.dto");
let TradesController = class TradesController {
    constructor(trades) {
        this.trades = trades;
    }
    list(userId, query) {
        return this.trades.list(userId, query);
    }
    findOne(userId, id) {
        return this.trades.findOne(userId, id);
    }
    create(userId, dto) {
        return this.trades.create(userId, dto);
    }
    update(userId, id, dto) {
        return this.trades.update(userId, id, dto);
    }
    close(userId, id, dto) {
        return this.trades.close(userId, id, dto);
    }
    duplicate(userId, id) {
        return this.trades.duplicate(userId, id);
    }
    remove(userId, id) {
        return this.trades.remove(userId, id);
    }
};
exports.TradesController = TradesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_trades_dto_1.QueryTradesDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_trade_dto_1.CreateTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_trade_dto_1.UpdateTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, close_trade_dto_1.CloseTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "remove", null);
exports.TradesController = TradesController = __decorate([
    (0, common_1.UseGuards)(telegram_auth_guard_1.TelegramAuthGuard),
    (0, common_1.Controller)('trades'),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradesController);
//# sourceMappingURL=trades.controller.js.map