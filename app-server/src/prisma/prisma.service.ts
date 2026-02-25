import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      adapter: new PrismaPg(configService.get<string>('DATABASE_URL')!),
    });
  }
}
