import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TelemetrySchema } from 'app-shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async addTelemetry(body: unknown) {
    const result = TelemetrySchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.issues);
    const data = result.data;
    const channel = await this.prisma.channel.findUnique({
      where: { name: data.channelRef },
    });
    if (!channel)
      throw new NotFoundException(`Channel not found: ${data.channelRef}`);
    const device = await this.prisma.device.upsert({
      where: {
        channelRef_name: { channelRef: channel.id, name: data.deviceName },
      },
      create: { name: data.deviceName, channelRef: channel.id },
      update: {},
    });
    await this.prisma.telemetry.create({
      data: {
        moisture: data.moisture,
        battery: data.battery,
        deviceRef: device.id,
      },
    });
    return { success: true };
  }

  async deleteOldTelemetry() {
    const maxLifetime = 14 * 24 * 60 * 60 * 1000; // 14 days
    await this.prisma.telemetry.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - maxLifetime) },
      },
    });
  }

  async getTelemetry(channelRef: string, limit: number) {
    const channel = await this.prisma.channel.findUnique({
      where: { name: channelRef },
      include: { devices: true },
    });
    if (!channel)
      throw new NotFoundException(`Channel not found: ${channelRef}`);
    const deviceIds = channel.devices.map((d) => d.id);
    const readings = await this.prisma.telemetry.findMany({
      where: { deviceRef: { in: deviceIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { device: { select: { name: true } } },
    });
    return { success: true, readings };
  }
}
