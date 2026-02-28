import { Injectable } from '@nestjs/common';
import * as z from 'zod';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription } from '../users/users.service';

const MessageSchema = z.object({
  userRef: z.email(),
  channelRef: z.string(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
});

export type UserMessage = z.infer<typeof MessageSchema>;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteOldNotifications() {
    const maxLifetime = 2 * 24 * 60 * 60 * 1000; // 2 days
    await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - maxLifetime),
        },
      },
    });
  }

  async sendNotification(message: UserMessage) {
    const user = await this.prisma.user.findUnique({
      where: { email: message.userRef },
    });
    const channel = await this.prisma.channel.findUnique({
      where: { name: message.channelRef },
      include: {
        users: {
          include: {
            user: {
              include: {
                subscriptions: true,
              },
            },
          },
        },
      },
    });
    if (!user || !channel) {
      throw new Error('Message could not be send: Missing user or channel.');
    }
    // Store notifications
    await Promise.allSettled(
      channel.users.map(({ user: channelUser }) =>
        this.prisma.user.update({
          where: { email: channelUser.email },
          data: {
            notifications: {
              create: {
                title: message.title,
                body: message.body,
                author: user.nickname,
                channel: channel.name,
              },
            },
            subscriptions: {
              updateMany: {
                where: {},
                data: {
                  counter: { increment: 1 },
                },
              },
            },
          },
        }),
      ),
    );
    // Try to send Web Push Notifications
    webpush.setVapidDetails(
      'https://digimunea.de',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    const subscriptions = channel.users.flatMap(
      ({ user: channelUser }) => channelUser.subscriptions,
    );
    const sendResults = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          subscription.data as Subscription,
          JSON.stringify({
            title: message.title,
            body: `${message.body} [Von: ${user.nickname}, Kanal: ${channel.name}]`,
          }),
        ),
      ),
    );
    // Cleanup dead subscriptions
    await Promise.allSettled(
      sendResults
        .map((result, index) => ({
          result,
          subscription: subscriptions[index],
        }))
        .filter(
          ({ result }) =>
            result.status === 'rejected' &&
            (result?.reason?.body?.includes('InvalidRegistration') ||
              result?.reason?.statusCode === 404 ||
              result?.reason?.statusCode === 410),
        )
        .map(({ subscription }) =>
          this.prisma.subscription.delete({
            where: { id: subscription.id },
          }),
        ),
    );
    return { success: true };
  }
}
