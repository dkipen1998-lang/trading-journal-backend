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
exports.SetupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SetupsService = class SetupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId) {
        return this.prisma.setup.findMany({ where: { userId }, orderBy: { name: 'asc' } });
    }
    create(userId, name) {
        return this.prisma.setup.upsert({
            where: { userId_name: { userId, name } },
            update: {},
            create: { userId, name },
        });
    }
    async remove(userId, id) {
        const setup = await this.prisma.setup.findFirst({ where: { id, userId } });
        if (!setup)
            throw new common_1.NotFoundException('Setup not found');
        await this.prisma.setup.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.SetupsService = SetupsService;
exports.SetupsService = SetupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupsService);
//# sourceMappingURL=setups.service.js.map