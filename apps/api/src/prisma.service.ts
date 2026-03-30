import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      console.log('PrismaService: Initializing native connection...');
      await this.$connect();
      console.log('PrismaService: Connected successfully!');
    } catch (error) {
      console.error('PrismaService: Connection failed!', error);
      process.exit(1);
    }
  }
}
