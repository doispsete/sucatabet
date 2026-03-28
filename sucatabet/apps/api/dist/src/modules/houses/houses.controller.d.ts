import { HousesService } from './houses.service';
import { CreateHouseDto, UpdateHouseDto } from './dto/house.dto';
export declare class HousesController {
    private readonly housesService;
    constructor(housesService: HousesService);
    findAll(): Promise<{}>;
    create(req: any, createHouseDto: CreateHouseDto): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
    update(id: string, req: any, updateHouseDto: UpdateHouseDto): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    }>;
}
