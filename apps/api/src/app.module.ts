import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts/accounts.module';
import { OperationsModule } from './modules/operations/operations.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './modules/common/common.module';
import { HousesModule } from './modules/houses/houses.module';
import { UsersModule } from './modules/users/users.module';
import { CpfProfilesModule } from './modules/cpf-profiles/cpf-profiles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { FreebetsModule } from './modules/freebets/freebets.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { BankModule } from './modules/bank/bank.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { SofascoreModule } from './modules/sofascore/sofascore.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 1000,
    }, {
      name: 'login',
      ttl: 900,
      limit: 100,
    }]),
    PrismaModule,
    AccountsModule, 
    OperationsModule, 
    AuthModule, 
    CommonModule, 
    HousesModule, 
    UsersModule, 
    CpfProfilesModule, 
    AuditLogsModule, 
    FreebetsModule, 
    DashboardModule, 
    ReportsModule, 
    JobsModule,
    BankModule,
    ExpensesModule,
    StripeModule,
    SofascoreModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
