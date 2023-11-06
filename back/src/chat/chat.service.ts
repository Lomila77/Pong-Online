import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  async createChannel(chat: ChatDto) {
    if (
      await this.prisma.channel.findUnique({
        where: {
          name: chat.name,
        },
      })
    )
      throw new ForbiddenException('Credential Taken');
    return this.prisma.channel.create({
      data: {
        owner: chat.owner,
        name: chat.name,
        type: chat.type,
        password: chat.password,
        creationDate: chat.creationDate,
        userFortytwo_id: chat.userFortytwo_id,
      },
    });
  }
}
