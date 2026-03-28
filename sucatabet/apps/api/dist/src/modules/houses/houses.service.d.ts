import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateHouseDto, UpdateHouseDto } from './dto/house.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class HousesService {
    private prisma;
    private auditLogs;
    private cacheManager;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService, cacheManager: Cache);
    private getLogoUrl;
    findAll(): Promise<{}>;
    create(executedBy: string, createHouseDto: CreateHouseDto): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
    update(id: string, executedBy: string, updateHouseDto: UpdateHouseDto): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
    remove(id: string, executedBy: string): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
}
