import { ReportsService } from './reports.service';
import { ProfitReportDto } from './dto/report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getProfit(req: any, query: ProfitReportDto): Promise<{
        label: any;
        profit: number;
    }[]>;
}
