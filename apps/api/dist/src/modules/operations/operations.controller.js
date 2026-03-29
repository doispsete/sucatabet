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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const operations_service_1 = require("./operations.service");
const operation_dto_1 = require("./dto/operation.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let OperationsController = class OperationsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    findAll(req, page, limit, status, startDate, endDate, search) {
        return this.operationsService.findAll(req.user.userId, req.user.role, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            status: status,
            startDate,
            endDate,
            search,
        });
    }
    findOne(id, req) {
        return this.operationsService.findOne(id, req.user.userId, req.user.role);
    }
    create(req, createOperationDto) {
        return this.operationsService.create(req.user.userId, createOperationDto);
    }
    update(id, req, updateDto) {
        return this.operationsService.update(id, req.user.userId, req.user.role, updateDto);
    }
    close(id, req, closeDto) {
        return this.operationsService.close(id, req.user.userId, req.user.role, closeDto);
    }
    void(id, req) {
        return this.operationsService.void(id, req.user.userId, req.user.role);
    }
    remove(id, req) {
        return this.operationsService.remove(id, req.user.userId, req.user.role);
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, operation_dto_1.CreateOperationDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, operation_dto_1.CreateOperationDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, operation_dto_1.CloseOperationDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "close", null);
__decorate([
    (0, common_1.Patch)(':id/void'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "void", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "remove", null);
exports.OperationsController = OperationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('operations'),
    __metadata("design:paramtypes", [operations_service_1.OperationsService])
], OperationsController);
