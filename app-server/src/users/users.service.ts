import { Injectable } from '@nestjs/common';
import {
  type NewUser,
  type UpdateUser,
  type Subscription,
  NewUserSchema,
  UpdateUserSchema,
} from 'app-shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUser(data: NewUser | UpdateUser) {
    const isUpdate = 'userRef' in data;
    if (isUpdate) {
      const currentUser = await this.getUser(data.userRef);
      if (!currentUser) throw new Error('User not found');
      const userData = UpdateUserSchema.parse(data);
      const isChannelUpdate =
        userData?.channels && userData.channels.length > 0;
      const isSubscriptionUpdate = userData?.subscription !== undefined;
      const updatedUser = await this.prisma.user.update({
        where: { email: userData.userRef },
        data: {
          ...(isChannelUpdate && {
            channels: {
              deleteMany: {},
              create: userData.channels!.map((channelRef) => ({
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
              create: {
                data: userData.subscription as Subscription,
              },
            },
          }),
        },
      });
      return { success: true, user: updatedUser };
    } else {
      const userData = NewUserSchema.parse(data);
      const user = await this.prisma.user.create({
        data: {
          nickname: userData.nickname,
          email: userData.email,
          subscriptions: {
            create: {
              data: userData.subscription as Subscription,
            },
          },
          channels: {
            create: userData.channels.map((channelRef) => ({
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
      return { success: true, user: user };
    }
  }

  async getUser(userRef: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userRef },
      include: {
        channels: {
          include: {
            channel: true,
          },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!user) throw new Error('User not found');
    return { success: true, user: user };
  }

  async removeUser(userRef: string) {
    await this.prisma.$transaction([
      this.prisma.usersOnChannels.deleteMany({
        where: { userRef },
      }),
      this.prisma.notification.deleteMany({
        where: { userRef },
      }),
      this.prisma.subscription.deleteMany({
        where: { userRef },
      }),
      this.prisma.user.delete({
        where: { email: userRef },
      }),
    ]);
    return { success: true };
  }
}
