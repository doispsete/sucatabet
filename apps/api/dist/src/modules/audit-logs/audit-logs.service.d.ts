import { PrismaService } from '../../prisma.service';
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(action: string, entity: string, entityId: string, executedBy: string, oldValue?: any, newValue?: any, tx?: any): Promise<any>;
}
