import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, AmountDto } from './dto/account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    findAll(req: any): Promise<({
        cpfProfile: {
            id: string;
            cpf: string;
            name: string;
            userId: string;
        };
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
    })[]>;
    findOne(id: string, req: any): Promise<{
        cpfProfile: {
            id: string;
            cpf: string;
            name: string;
            userId: string;
        };
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
    }>;
    create(req: any, createAccountDto: CreateAccountDto): Promise<{
        cpfProfileId: string;
        bettingHouseId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        inOperation: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deposit(id: string, req: any, amountDto: AmountDto): Promise<{
        cpfProfileId: string;
        bettingHouseId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        inOperation: import("@prisma/client-runtime-utils").Decimal;
    }>;
    withdraw(id: string, req: any, amountDto: AmountDto): Promise<{
        cpfProfileId: string;
        bettingHouseId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        inOperation: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(id: string, req: any, updateAccountDto: UpdateAccountDto): Promise<{
        cpfProfileId: string;
        bettingHouseId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        inOperation: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(id: string, req: any): Promise<{
        cpfProfileId: string;
        bettingHouseId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        inOperation: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getHistory(id: string, req: any): Promise<({
        user: {
            name: string;
        };
    } & {
        id: string;
        action: string;
        entity: string;
        entityId: string;
        oldValue: import("@prisma/client/runtime/client").JsonValue | null;
        newValue: import("@prisma/client/runtime/client").JsonValue | null;
        executedBy: string;
        createdAt: Date;
    })[]>;
}
