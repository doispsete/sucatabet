import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any);
    super({ adapter } as any);
  }

  async onModuleInit() {
    try {
      console.log('PrismaService: Initializing with Driver Adapter...');
      await this.$connect();
      console.log('PrismaService: Connected successfully!');
    } catch (error) {
      console.error('PrismaService: Connection failed!', error);
      process.exit(1);
    }
  }
}
