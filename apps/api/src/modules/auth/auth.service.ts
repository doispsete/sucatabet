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
        status: UserStatus.ACTIVE, // TODO: Update to auto-approve new registrations
        plan: UserPlan.FREE,
        bankAccount: {
          create: {
            balance: 0,
            monthlyGoal: 0,
          },
        },
      },
    });

    return { message: "Cadastro realizado com sucesso. Bem-vindo!" };
  }

  async login(loginDto: LoginDto) {
    try {
      console.log(`[AUTH] Tentativa de login para: ${loginDto.email}`);
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        console.warn(`[AUTH] Usuário não encontrado: ${loginDto.email}`);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AUTH] Usuário encontrado. Validando senha...`);
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        console.warn(`[AUTH] Senha inválida para: ${loginDto.email}`);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AUTH] Senha ok. Validando status: ${user.status}`);
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

      console.log(`[AUTH] Status ok. Gerando token com plano: ${user.plan}`);
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name, 
        plan: user.plan 
      };

      const token = this.jwtService.sign(payload);
      console.log(`[AUTH] Token gerado com sucesso.`);

      // Atualiza último login de forma assíncrona (Desativado temporariamente para fix build local)
      /*
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }).catch(e => console.error('[AUTH_ERROR] Erro ao atualizar lastLoginAt:', e));
      */

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error) {
      console.error('[AUTH_ERROR] Erro crítico no login:', error);
      // Re-throw para o global exception filter se for uma exceção do Nest
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      // Se for erro interno (Prisma, etc), logamos e re-lançamos
      throw error;
    }
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
