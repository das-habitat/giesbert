import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler]
})
export class NotificationsModule {}
