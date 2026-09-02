import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { username: string; password: string }) {
    const userExists = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (userExists) throw new BadRequestException('Usuário já existe');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { username: data.username, password: hashedPassword },
      select: { id: true, username: true },
    });
  }

  async login(data: { username: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (!user) throw new BadRequestException('Usuário ou senha inválidos');

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new BadRequestException('Usuário ou senha inválidos');

    return { id: user.id, username: user.username };
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        posts: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}