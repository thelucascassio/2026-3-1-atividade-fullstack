import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() body: { content: string; authorId: string }) {
    return this.postsService.create(body);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.postsService.findAll(search);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') postId: string,
    @Body() body: { content: string; authorId: string; parentId?: string },
  ) {
    return this.postsService.addComment(postId, body);
  }

  @Post(':id/rate')
  ratePost(
    @Param('id') postId: string,
    @Body() body: { userId: string; stars: number },
  ) {
    return this.postsService.ratePost(postId, body.userId, body.stars);
  }
}