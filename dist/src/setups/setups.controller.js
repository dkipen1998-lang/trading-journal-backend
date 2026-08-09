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
exports.SetupsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const telegram_auth_guard_1 = require("../auth/telegram-auth.guard");
const current_user_decorator_1 = require("../common/current-user.decorator");
const setups_service_1 = require("./setups.service");
class CreateSetupDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSetupDto.prototype, "name", void 0);
let SetupsController = class SetupsController {
    constructor(setups) {
        this.setups = setups;
    }
    list(userId) {
        return this.setups.list(userId);
    }
    create(userId, dto) {
        return this.setups.create(userId, dto.name);
    }
    remove(userId, id) {
        return this.setups.remove(userId, id);
    }
};
exports.SetupsController = SetupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSetupDto]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "remove", null);
exports.SetupsController = SetupsController = __decorate([
    (0, common_1.UseGuards)(telegram_auth_guard_1.TelegramAuthGuard),
    (0, common_1.Controller)('setups'),
    __metadata("design:paramtypes", [setups_service_1.SetupsService])
], SetupsController);
//# sourceMappingURL=setups.controller.js.map