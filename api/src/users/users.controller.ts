import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() body: { username: string; password: string }) {
    return this.usersService.create(body);
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.usersService.login(body);
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}