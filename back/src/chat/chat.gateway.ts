import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;
  private userSockets = new Map<number, Socket>();
  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() msg: string): Promise<void> {
    console.log(msg);
  }

  afterInit(server: Server) {
    // Initialisation du serveur WebSocket
    console.log(server);
  }

  handleConnection(client: Socket, user: User) {
    this.userSockets.set(user.fortytwo_id, client);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.userSockets) {
      if (socket === client) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }
}
