import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('telemetry')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async create(@Body() body: unknown) {
    return this.devicesService.addTelemetry(body);
  }

  @Get()
  async get(
    @Query('channelRef') channelRef: string,
    @Query('limit') limit = '14',
  ) {
    return this.devicesService.getTelemetry(channelRef, parseInt(limit));
  }
}
