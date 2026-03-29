import { PrismaService } from '../../prisma.service';
import { ProfitReportDto } from './dto/report.dto';
import { UserRole } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfitReport(userId: string, role: UserRole, query: ProfitReportDto): Promise<{
        label: any;
        profit: number;
    }[]>;
}
