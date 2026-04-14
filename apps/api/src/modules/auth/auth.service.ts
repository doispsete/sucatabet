import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserRole, UserStatus, UserPlan } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está sendo utilizado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.OPERATOR,
        status: UserStatus.PENDING,
        plan: UserPlan.FREE,
        bankAccount: {
          create: {
            balance: 0,
            monthlyGoal: 0,
          },
        },
      },
    });

    return { message: "Cadastro realizado. Aguarde aprovação." };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Validação de Status
    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Sua conta está aguardando aprovação.');
    }
    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException('Seu acesso foi negado. Entre em contato.');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Sua conta está suspensa.');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Conta inativa.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    };
  }

  async refreshToken(user: any) {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser || dbUser.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Sessão inválida ou conta inativa');
    }

    const payload = { sub: user.userId, email: user.email, role: user.role, plan: dbUser.plan };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
