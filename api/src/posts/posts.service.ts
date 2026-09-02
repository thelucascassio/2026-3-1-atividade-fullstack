import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { content: string; authorId: string }) {
    return this.prisma.post.create({
      data,
      include: { author: { select: { id: true, username: true } } },
    });
  }

  async findAll(search?: string) {
    return this.prisma.post.findMany({
      where: search ? { content: { contains: search } } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true } },
        ratings: true,
        comments: {
          where: { parentId: null }, // Retorna comentários raiz
          include: {
            author: { select: { id: true, username: true } },
            replies: {
              include: { author: { select: { id: true, username: true } } },
            },
          },
        },
      },
    });
  }

  async addComment(postId: string, data: { content: string; authorId: string; parentId?: string }) {
    return this.prisma.comment.create({
      data: {
        content: data.content,
        postId,
        authorId: data.authorId,
        parentId: data.parentId || null,
      },
      include: { author: { select: { id: true, username: true } } },
    });
  }

  async ratePost(postId: string, userId: string, stars: number) {
    if (stars < 1 || stars > 3) throw new BadRequestException('A avaliação deve ser entre 1 e 3 estrelas');

    return this.prisma.rating.upsert({
      where: { userId_postId: { userId, postId } },
      update: { stars },
      create: { userId, postId, stars },
    });
  }
}