import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(req: any, startDate?: string, endDate?: string): Promise<{}>;
    getClubProgress(req: any): Promise<{}>;
}
