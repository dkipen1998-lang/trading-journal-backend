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
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let ImagesService = class ImagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async presign(userId, tradeId, imageType) {
        const key = `${userId}/${tradeId}/${imageType}-${crypto.randomUUID()}`;
        return {
            uploadUrl: `https://YOUR_BUCKET.s3.amazonaws.com/${key}?PLACEHOLDER_SIGNATURE`,
            publicUrl: `https://YOUR_BUCKET.s3.amazonaws.com/${key}`,
            key,
        };
    }
    async confirm(userId, tradeId, imageType, imageUrl) {
        const trade = await this.prisma.trade.findFirst({ where: { id: tradeId, userId } });
        if (!trade)
            throw new common_1.NotFoundException('Trade not found');
        return this.prisma.tradeImage.create({
            data: { tradeId, imageType, imageUrl },
        });
    }
    async remove(userId, imageId) {
        const image = await this.prisma.tradeImage.findFirst({
            where: { id: imageId, trade: { userId } },
        });
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await this.prisma.tradeImage.delete({ where: { id: imageId } });
        return { deleted: true };
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImagesService);
//# sourceMappingURL=images.service.js.map