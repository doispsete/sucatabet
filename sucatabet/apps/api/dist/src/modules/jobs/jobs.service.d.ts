import { PrismaService } from '../../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class JobsService {
    private prisma;
    private auditLogs;
    private readonly logger;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    handleWeeklyReset(): Promise<void>;
    handleFreebetAlerts(): Promise<void>;
    handleWeeklyGoalAlerts(): Promise<void>;
}
