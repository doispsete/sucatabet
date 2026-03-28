import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    refresh(req: any): Promise<{
        access_token: string;
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    getMe(req: any): any;
}
