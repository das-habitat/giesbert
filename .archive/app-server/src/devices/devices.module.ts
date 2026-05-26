import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesScheduler } from './devices.scheduler';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DevicesScheduler],
})
export class DevicesModule {}
