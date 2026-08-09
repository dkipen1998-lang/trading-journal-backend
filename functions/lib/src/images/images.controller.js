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
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const telegram_auth_guard_1 = require("../auth/telegram-auth.guard");
const current_user_decorator_1 = require("../common/current-user.decorator");
const images_service_1 = require("./images.service");
class PresignDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['entry', 'exit']),
    __metadata("design:type", String)
], PresignDto.prototype, "imageType", void 0);
class ConfirmImageDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['entry', 'exit']),
    __metadata("design:type", String)
], ConfirmImageDto.prototype, "imageType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmImageDto.prototype, "imageUrl", void 0);
let ImagesController = class ImagesController {
    constructor(images) {
        this.images = images;
    }
    presign(userId, tradeId, dto) {
        return this.images.presign(userId, tradeId, dto.imageType);
    }
    confirm(userId, tradeId, dto) {
        return this.images.confirm(userId, tradeId, dto.imageType, dto.imageUrl);
    }
    remove(userId, id) {
        return this.images.remove(userId, id);
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Post)('trades/:id/images/presign'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, PresignDto]),
    __metadata("design:returntype", void 0)
], ImagesController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('trades/:id/images'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ConfirmImageDto]),
    __metadata("design:returntype", void 0)
], ImagesController.prototype, "confirm", null);
__decorate([
    (0, common_1.Delete)('images/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ImagesController.prototype, "remove", null);
exports.ImagesController = ImagesController = __decorate([
    (0, common_1.UseGuards)(telegram_auth_guard_1.TelegramAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
//# sourceMappingURL=images.controller.js.map