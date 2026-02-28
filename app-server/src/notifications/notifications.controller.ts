import { Body, Controller, ParseEnumPipe, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationAction, type UserMessage } from 'app-shared';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async handleAction(
    @Body() body: UserMessage,
    @Query('action', new ParseEnumPipe(NotificationAction))
    action: NotificationAction,
  ) {
    switch (action) {
      case NotificationAction.send:
        return this.notificationsService.sendNotification(body);
    }
  }
}
