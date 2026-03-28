"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorService = void 0;
const common_1 = require("@nestjs/common");
let CalculatorService = class CalculatorService {
    calculateSurebet(totalStake, odds) {
        const individualArbitrage = odds.map(o => 1 / o);
        const totalArbitrage = individualArbitrage.reduce((a, b) => a + b, 0);
        const profit = (1 / totalArbitrage - 1) * 100;
        const stakes = individualArbitrage.map(ia => (ia / totalArbitrage) * totalStake);
        return {
            stakes: stakes.map(s => Number(s.toFixed(2))),
            profitPercent: Number(profit.toFixed(2)),
            expectedProfit: Number((totalStake * (profit / 100)).toFixed(2)),
            isArbitrage: totalArbitrage < 1
        };
    }
    calculateROI(stake, profit) {
        if (stake === 0)
            return 0;
        return Number(((profit / stake) * 100).toFixed(2));
    }
};
exports.CalculatorService = CalculatorService;
exports.CalculatorService = CalculatorService = __decorate([
    (0, common_1.Injectable)()
], CalculatorService);
