import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Subscription, NewUserSchema, UpdateUserSchema } from 'app-shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUser(data: unknown) {
    const isUpdate =
      typeof data === 'object' && data !== null && 'userRef' in data;
    if (isUpdate) {
      const result = UpdateUserSchema.safeParse(data);
      if (!result.success) throw new BadRequestException(result.error.issues);
      const { userRef, channels, subscription } = result.data;
      const isChannelUpdate = channels && channels.length > 0;
      const isSubscriptionUpdate = subscription !== undefined;
      const updatedUser = await this.prisma.user.update({
        where: { email: userRef },
        include: { channels: { include: { channel: true } } },
        data: {
          ...(isChannelUpdate && {
            channels: {
              deleteMany: {},
              create: channels.map((channelRef) => ({
                channel: {
                  connectOrCreate: {
                    where: { name: channelRef },
                    create: { name: channelRef },
                  },
                },
              })),
            },
          }),
          ...(isSubscriptionUpdate && {
            subscriptions: {
              create: { data: subscription as Subscription },
            },
          }),
        },
      });
      return { success: true, user: updatedUser };
    } else {
      const result = NewUserSchema.safeParse(data);
      if (!result.success) throw new BadRequestException(result.error.issues);
      const { nickname, email, channels, subscription } = result.data;
      const user = await this.prisma.user.create({
        include: { channels: { include: { channel: true } } },
        data: {
          nickname,
          email,
          subscriptions: {
            create: { data: subscription as Subscription },
          },
          channels: {
            create: channels.map((channelRef) => ({
              channel: {
                connectOrCreate: {
                  where: { name: channelRef },
                  create: { name: channelRef },
                },
              },
            })),
          },
        },
      });
      return { success: true, user };
    }
  }

  async getUser(userRef: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userRef },
      include: { channels: { include: { channel: true } } },
    });
    if (!user) throw new NotFoundException(`User not found: ${userRef}`);
    return { success: true, user };
  }

  async removeUser(userRef: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userRef },
    });
    if (!user) throw new NotFoundException(`User not found: ${userRef}`);
    await this.prisma.$transaction([
      this.prisma.usersOnChannels.deleteMany({ where: { userRef: user.id } }),
      this.prisma.subscription.deleteMany({ where: { userRef: user.id } }),
      this.prisma.user.delete({ where: { id: user.id } }),
    ]);
    return { success: true };
  }
}
