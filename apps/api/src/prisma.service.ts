import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (!process.env.DATABASE_URL) {
      console.error('CRITICAL: DATABASE_URL is not defined in process.env!');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any);
    super({ adapter } as any);
  }

  async onModuleInit() {
    try {
      const url = process.env.DATABASE_URL || 'UNDEFINED';
      const maskedUrl = url.replace(/:.*@/, ':****@');
      console.log(`PrismaService: Initializing with URL: ${maskedUrl}`);
      
      await this.$connect();
      console.log('PrismaService: Connected successfully!');
    } catch (error) {
      console.error('PrismaService: Connection failed!', error);
      // Não sai do processo no ambiente local para não quebrar o dev server
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
