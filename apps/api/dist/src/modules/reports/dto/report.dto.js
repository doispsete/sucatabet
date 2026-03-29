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
exports.ProfitReportDto = void 0;
const class_validator_1 = require("class-validator");
class ProfitReportDto {
    period = 'daily';
    groupBy = 'category';
    startDate;
    endDate;
    userId;
}
exports.ProfitReportDto = ProfitReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(['daily', 'weekly', 'monthly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['account', 'house', 'type', 'category', 'result']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "groupBy", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "userId", void 0);
