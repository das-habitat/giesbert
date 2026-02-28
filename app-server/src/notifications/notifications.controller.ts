import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  NotificationsService,
  type UserMessage,
} from './notifications.service';

const ACTIONS = {
  send: 'send',
};

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async handleAction(
    @Body() body: UserMessage,
    @Query('action') action: string,
  ) {
    switch (action) {
      case ACTIONS.send:
        return this.notificationsService.sendNotification(body);
      default:
        throw new HttpException(
          { error: `Failed to perform action "${action}"` },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
