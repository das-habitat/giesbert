import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron('0 1 * * *') // every day at 1 AM
  async handleCron() {
    await this.notificationsService.deleteOldNotifications();
  }
}
