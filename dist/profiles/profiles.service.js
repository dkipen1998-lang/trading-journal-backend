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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProfilesService = class ProfilesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId) {
        return this.prisma.profile.findMany({ where: { userId }, orderBy: { name: 'asc' } });
    }
    create(userId, dto) {
        return this.prisma.profile.create({
            data: {
                userId,
                name: dto.name,
                defaultRiskPerTrade: dto.defaultRiskPerTrade ?? undefined,
                accountSize: dto.accountSize ?? undefined,
                settings: dto.settings,
            },
        });
    }
    async update(userId, id, dto) {
        const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return this.prisma.profile.update({
            where: { id },
            data: {
                name: dto.name ?? undefined,
                defaultRiskPerTrade: dto.defaultRiskPerTrade ?? undefined,
                accountSize: dto.accountSize ?? undefined,
                settings: dto.settings ?? undefined,
            },
        });
    }
    async remove(userId, id) {
        const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        await this.prisma.profile.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map