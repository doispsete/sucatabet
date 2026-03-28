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
exports.CpfProfilesController = void 0;
const common_1 = require("@nestjs/common");
const cpf_profiles_service_1 = require("./cpf-profiles.service");
const create_cpf_profile_dto_1 = require("./dto/create-cpf-profile.dto");
const update_cpf_profile_dto_1 = require("./dto/update-cpf-profile.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CpfProfilesController = class CpfProfilesController {
    cpfProfilesService;
    constructor(cpfProfilesService) {
        this.cpfProfilesService = cpfProfilesService;
    }
    create(req, createCpfProfileDto) {
        return this.cpfProfilesService.create(req.user.userId, createCpfProfileDto);
    }
    findAll(req, targetUserId) {
        return this.cpfProfilesService.findAll(req.user.userId, req.user.role, targetUserId);
    }
    findOne(id, req) {
        return this.cpfProfilesService.findOne(id, req.user.userId, req.user.role);
    }
    update(id, req, updateCpfProfileDto) {
        return this.cpfProfilesService.update(id, req.user.userId, req.user.role, updateCpfProfileDto);
    }
    remove(id, req) {
        return this.cpfProfilesService.remove(id, req.user.userId, req.user.role);
    }
};
exports.CpfProfilesController = CpfProfilesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cpf_profile_dto_1.CreateCpfProfileDto]),
    __metadata("design:returntype", void 0)
], CpfProfilesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CpfProfilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CpfProfilesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_cpf_profile_dto_1.UpdateCpfProfileDto]),
    __metadata("design:returntype", void 0)
], CpfProfilesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CpfProfilesController.prototype, "remove", null);
exports.CpfProfilesController = CpfProfilesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cpf-profiles'),
    __metadata("design:paramtypes", [cpf_profiles_service_1.CpfProfilesService])
], CpfProfilesController);
