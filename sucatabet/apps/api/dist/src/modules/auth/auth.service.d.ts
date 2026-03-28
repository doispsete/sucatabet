import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    refreshToken(user: any): Promise<{
        access_token: string;
    }>;
}
