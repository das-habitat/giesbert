import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import webpush, { WebPushError } from 'web-push';
import { type Subscription, MessageSchema } from 'app-shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {
    webpush.setVapidDetails(
      `https://${process.env.SITE_ADDRESS}`,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  async getNotifications(channelRef: string, limit: number = 5) {
    const channel = await this.prisma.channel.findUnique({
      where: { name: channelRef },
    });
    if (!channel)
      throw new NotFoundException(`Channel not found: ${channelRef}`);
    const notifications = await this.prisma.notification.findMany({
      where: { channelRef: channel.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return { success: true, notifications };
  }

  async deleteOldNotifications() {
    const maxLifetime = 14 * 24 * 60 * 60 * 1000; // 14 days
    await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - maxLifetime) },
      },
    });
  }

  async sendNotification(body: unknown) {
    const result = MessageSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.issues);
    const message = result.data;
    const channel = await this.prisma.channel.findUnique({
      where: { name: message.channelRef },
      include: {
        users: {
          include: {
            user: { include: { subscriptions: true } },
          },
        },
      },
    });
    if (!channel)
      throw new NotFoundException(`Channel not found: ${message.channelRef}`);
    await this.prisma.notification.create({
      data: {
        title: message.title,
        body: message.body,
        author: message.author,
        channelRef: channel.id,
      },
    });
    const subscriptions = channel.users.flatMap(
      ({ user }) => user.subscriptions,
    );
    await this.prisma.subscription.updateMany({
      where: { id: { in: subscriptions.map((s) => s.id) } },
      data: { counter: { increment: 1 } },
    });
    const sendResults = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          subscription.data as Subscription,
          JSON.stringify({
            title: message.title,
            body: `${message.body} [Kanal: ${channel.name}]`,
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
        .filter(({ result }) => {
          if (result.status !== 'rejected') return false;
          const reason = result.reason as WebPushError;
          return (
            reason.body.includes('InvalidRegistration') ||
            reason.statusCode === 404 ||
            reason.statusCode === 410
          );
        })
        .map(({ subscription }) =>
          this.prisma.subscription.delete({ where: { id: subscription.id } }),
        ),
    );
    return { success: true };
  }
}
