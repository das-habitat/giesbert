import {
  Body,
  Controller,
  Get,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationAction } from 'app-shared';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async get(
    @Query('channelRef') channelRef: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotifications(
      channelRef,
      limit ? parseInt(limit) : 5,
    );
  }

  @Post()
  async handleAction(
    @Body() body: unknown,
    @Query('action', new ParseEnumPipe(NotificationAction))
    action: NotificationAction,
  ) {
    switch (action) {
      case NotificationAction.send:
        return this.notificationsService.sendNotification(body);
    }
  }
}
