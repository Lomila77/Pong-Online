import { Body, Controller, Post } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Post()
  createChannel(@Body() chat: ChatDto) {
    return this.chatService.createChannel(chat);
  }
}
