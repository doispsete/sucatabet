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
exports.CloseOperationDto = exports.CreateOperationDto = exports.BetDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class BetDto {
    accountId;
    odds;
    stake;
    side;
    type;
    commission;
    isBenefit;
}
exports.BetDto = BetDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BetDto.prototype, "accountId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.001),
    __metadata("design:type", Number)
], BetDto.prototype, "odds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], BetDto.prototype, "stake", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BetDto.prototype, "side", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BetDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BetDto.prototype, "commission", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BetDto.prototype, "isBenefit", void 0);
class CreateOperationDto {
    type;
    bets;
    freebetId;
    description;
}
exports.CreateOperationDto = CreateOperationDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OperationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BetDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateOperationDto.prototype, "bets", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "freebetId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "description", void 0);
class CloseOperationDto {
    status;
    result;
    winningBetIds;
    realProfit;
}
exports.CloseOperationDto = CloseOperationDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OperationStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CloseOperationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OperationResult),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CloseOperationDto.prototype, "result", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CloseOperationDto.prototype, "winningBetIds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CloseOperationDto.prototype, "realProfit", void 0);
