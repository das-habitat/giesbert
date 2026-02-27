import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as z from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const SubscriptionSchema = z.object({
    endpoint: z.string(),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

const UpdateUserSchema = z.object({
    userRef: z.email(),
    channels: z.array(z.string()).min(1).max(30).optional(),
    subscription: SubscriptionSchema.optional(),
});

const NewUserSchema = z.object({
    nickname: z.string().min(2).max(20),
    email: z.email(),
    channels: z.array(z.string()).min(1).max(30),
    subscription: SubscriptionSchema,
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserNotification = Prisma.NotificationGetPayload<object>;
export type FullUser = Prisma.UserGetPayload<{ include: { channels: true; notifications: true } }>;
export type User = Prisma.UserGetPayload<object>;

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async upsertUser(data: NewUser | UpdateUser) {
        const isUpdate = 'userRef' in data;
        if (isUpdate) {
            const currentUser = await this.getUser(data.userRef);
            if (!currentUser) throw new Error('User not found');
            const userData = UpdateUserSchema.parse(data);
            const isChannelUpdate = userData?.channels && userData.channels.length > 0;
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
