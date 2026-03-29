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
exports.FreebetsController = void 0;
const common_1 = require("@nestjs/common");
const freebets_service_1 = require("./freebets.service");
const freebet_dto_1 = require("./dto/freebet.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FreebetsController = class FreebetsController {
    freebetsService;
    constructor(freebetsService) {
        this.freebetsService = freebetsService;
    }
    findAll(req) {
        return this.freebetsService.findAll(req.user.userId, req.user.role);
    }
    findOne(id, req) {
        return this.freebetsService.findOne(id, req.user.userId, req.user.role);
    }
    create(req, createFreebetDto) {
        return this.freebetsService.create(req.user.userId, createFreebetDto);
    }
    update(id, req, updateFreebetDto) {
        return this.freebetsService.update(id, req.user.userId, req.user.role, updateFreebetDto);
    }
    remove(id, req) {
        return this.freebetsService.remove(id, req.user.userId, req.user.role);
    }
};
exports.FreebetsController = FreebetsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FreebetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FreebetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, freebet_dto_1.CreateFreebetDto]),
    __metadata("design:returntype", void 0)
], FreebetsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, freebet_dto_1.UpdateFreebetDto]),
    __metadata("design:returntype", void 0)
], FreebetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FreebetsController.prototype, "remove", null);
exports.FreebetsController = FreebetsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('freebets'),
    __metadata("design:paramtypes", [freebets_service_1.FreebetsService])
], FreebetsController);
