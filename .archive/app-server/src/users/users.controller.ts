import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Query('userRef') userRef: string) {
    if (!userRef) throw new BadRequestException('Missing userRef parameter');
    return this.usersService.getUser(userRef);
  }

  @Put()
  async upsertUser(@Body() body: unknown) {
    return this.usersService.upsertUser(body);
  }

  @Delete()
  async removeUser(@Body() body: { userRef: string }) {
    if (!body?.userRef)
      throw new BadRequestException('Missing userRef parameter');
    return this.usersService.removeUser(body.userRef);
  }
}
