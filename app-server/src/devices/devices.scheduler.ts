import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DevicesService } from './devices.service';

@Injectable()
export class DevicesScheduler {
  constructor(private readonly devicesService: DevicesService) {}

  @Cron('0 2 * * *') // every day at 2 AM
  async handleCron() {
    await this.devicesService.deleteOldTelemetry();
  }
}
