import { CpfProfilesService } from './cpf-profiles.service';
import { CreateCpfProfileDto } from './dto/create-cpf-profile.dto';
import { UpdateCpfProfileDto } from './dto/update-cpf-profile.dto';
export declare class CpfProfilesController {
    private readonly cpfProfilesService;
    constructor(cpfProfilesService: CpfProfilesService);
    create(req: any, createCpfProfileDto: CreateCpfProfileDto): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    findAll(req: any, targetUserId?: string): Promise<({
        accounts: ({
            bettingHouse: {
                id: string;
                name: string;
                domain: string | null;
                logoUrl: string | null;
            };
        } & {
            cpfProfileId: string;
            bettingHouseId: string;
            balance: import("@prisma/client-runtime-utils").Decimal;
            id: string;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        cpf: string;
        name: string;
        userId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        accounts: ({
            bettingHouse: {
                id: string;
                name: string;
                domain: string | null;
                logoUrl: string | null;
            };
        } & {
            cpfProfileId: string;
            bettingHouseId: string;
            balance: import("@prisma/client-runtime-utils").Decimal;
            id: string;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    update(id: string, req: any, updateCpfProfileDto: UpdateCpfProfileDto): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
}
