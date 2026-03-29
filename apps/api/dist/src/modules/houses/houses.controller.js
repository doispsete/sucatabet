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
exports.HousesController = void 0;
const common_1 = require("@nestjs/common");
const houses_service_1 = require("./houses.service");
const house_dto_1 = require("./dto/house.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let HousesController = class HousesController {
    housesService;
    constructor(housesService) {
        this.housesService = housesService;
    }
    findAll() {
        return this.housesService.findAll();
    }
    create(req, createHouseDto) {
        return this.housesService.create(req.user.userId, createHouseDto);
    }
    update(id, req, updateHouseDto) {
        return this.housesService.update(id, req.user.userId, updateHouseDto);
    }
    remove(id, req) {
        return this.housesService.remove(id, req.user.userId);
    }
};
exports.HousesController = HousesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HousesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, house_dto_1.CreateHouseDto]),
    __metadata("design:returntype", void 0)
], HousesController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, house_dto_1.UpdateHouseDto]),
    __metadata("design:returntype", void 0)
], HousesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HousesController.prototype, "remove", null);
exports.HousesController = HousesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('houses'),
    __metadata("design:paramtypes", [houses_service_1.HousesService])
], HousesController);
