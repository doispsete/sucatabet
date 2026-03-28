import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { UserRole } from '@prisma/client';
export declare class DashboardService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    getSummary(userId: string, role: UserRole, startDate?: string, endDate?: string): Promise<{}>;
    private calculatePerformanceData;
    getClubProgress(userId: string, role: UserRole): Promise<{}>;
}
