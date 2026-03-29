"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const accounts_module_1 = require("./modules/accounts/accounts.module");
const operations_module_1 = require("./modules/operations/operations.module");
const auth_module_1 = require("./modules/auth/auth.module");
const common_module_1 = require("./modules/common/common.module");
const houses_module_1 = require("./modules/houses/houses.module");
const users_module_1 = require("./modules/users/users.module");
const cpf_profiles_module_1 = require("./modules/cpf-profiles/cpf-profiles.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const freebets_module_1 = require("./modules/freebets/freebets.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const reports_module_1 = require("./modules/reports/reports.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.register({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60,
                    limit: 1000,
                }, {
                    name: 'login',
                    ttl: 900,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            accounts_module_1.AccountsModule,
            operations_module_1.OperationsModule,
            auth_module_1.AuthModule,
            common_module_1.CommonModule,
            houses_module_1.HousesModule,
            users_module_1.UsersModule,
            cpf_profiles_module_1.CpfProfilesModule,
            audit_logs_module_1.AuditLogsModule,
            freebets_module_1.FreebetsModule,
            dashboard_module_1.DashboardModule,
            reports_module_1.ReportsModule,
            jobs_module_1.JobsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
