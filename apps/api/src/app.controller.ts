import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('fix-db')
  async fixDb() {
    try {
      // 1. Criar Enum se não existir
      await this.prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN 
                CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'); 
            END IF; 
        END $$;
      `);

      // 2. Adicionar colunas se não existirem
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
      `);

      // 3. Ativar usuários existentes
      await this.prisma.$executeRawUnsafe(`
        UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING';
      `);

      return { status: 'success', message: 'Banco de dados corrigido manualmente.' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
