import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChannelCreateDto } from './dto/chat.dto';
import { ChannelMessageSendDto } from './dto/msg.dto';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';
import { QuitChanDto, JoinChanDto, ActionsChanDto, PlayChanDto } from "./dto/edit-chat.dto"
import { EditChannelCreateDto } from './dto/edit-chat.dto';
import { IsAdminDto } from './dto/admin.dto';
import * as jwt from 'jsonwebtoken';
import { backResInterface } from './../shared/shared.interface';

export interface User {
  id: number;
  username: string;
  email: string;
}
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: true,
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private clients: { [id: string]: { fortytwo_id: number; fortytwo_userName; pseudo: string; } } = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaClient,
    private readonly userService: UserService,
  ) { }

  async handleConnection(client: Socket): Promise<any> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('Token is missing');
        client.disconnect();
        return;
      }

      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decoded === 'object' && 'sub' in decoded) {
        const userId = decoded.sub;

        const user = await this.prisma.user.findUnique({
          where: {
            fortytwo_id: Number(userId),
          },
          select: {
            fortytwo_id: true,
            fortytwo_userName : true,
            pseudo: true,
          }
        })
        this.clients[client.id] = user;
      } else {
        console.log('Invalid token');
        client.disconnect();
        return;
      }
    }
    catch (e) {
      console.log(e);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    console.log("Disconnect")
    delete this.clients[client.id];
    client.disconnect();
  }


  @SubscribeMessage('Join Channel')
  async joinOrCreateChannel(
    @MessageBody() data: { info: ChannelCreateDto },
    @ConnectedSocket() client: Socket,
  ) {
    let channel;

    if (data.info.chanId) {
      channel = await this.chatService.getChannelById(data.info.chanId);
    } else {
      channel = await this.chatService.CreateChan(data.info);
    }

    if (!channel.isPrivate && !channel.isDM) {
      this.server.emit("Channel Created", { id: channel.id, name: data.info.name, members: data.info.members, type: data.info.type });
    } else {
      this.server.to(channel.id.toString()).emit("Channel Created", { id: channel.id, name: data.info.name, members: data.info.members, type: data.info.type });
    }

    // Rejoindre le canal
    if (this.clients[client.id] === undefined) {
      this.server.to(client.id).emit("error", "Error refresh the page!!!");
      return;
    }
    const user = await this.userService.getUser(this.clients[client.id].pseudo);
    const ret = await this.chatService.join_Chan({ chatId: channel.id }, user);
    if (ret === 0 || ret === 5) {
      client.join(channel.id.toString());
      if (ret !== 5)
        client.to(channel.id.toString()).emit("NewUserJoin", { username: user.fortytwo_userName, id: user.fortytwo_id, avatarUrl: user.avatar })
      this.server.to(client.id).emit("Channel Joined", { id: channel.id, name: data.info.name, members: data.info.members, type: data.info.type});

      if (channel.isDM)
      {
        const otherUser = await this.userService.getUserbyId(data.info.members[1]);
        const retOtherUser = await this.chatService.join_Chan({ chatId: channel.id }, otherUser);
        if (retOtherUser === 0 || retOtherUser === 5) {
          client.to(channel.id.toString()).emit("NewUserJoin", { username: otherUser.fortytwo_userName, id: otherUser.fortytwo_id, avatarUrl: otherUser.avatar });
          this.server.to(channel.id.toString()).emit("Channel Joined", { id: channel.id, name: data.info.name, members: data.info.members, type: data.info.type});
        }
      }
    }
    else if (ret == 1)
      this.server.to(client.id).emit("error", "NotInvited");
    else if (ret == 2)
      this.server.to(client.id).emit("error", "Banned");
    else if (ret == 3) {
      this.server.to(client.id).emit("error", "Wrong password");
    }
    else {
      this.server.to(client.id).emit("error", "This channel does not exist!!!");
    }
  }

  // @SubscribeMessage('create channel')
  // async createChannel(
  //   @MessageBody() data: { info: ChannelCreateDto, pseudo2: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   let channel = await this.chatService.CreateChan(data.info, this.clients[client.id].pseudo, data.pseudo2);
  //   if (!channel.isPrivate && !channel.isDM)
  //     this.server.emit("Channel Created", { name: data.info.chatName, id: channel.id, client_id: client.id });
  //   else
  //     this.server.to(client.id).emit("Channel Created", { name: data.info.chatName, id: channel.id, client_id: client.id });
  //   return;
  // }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: ChannelMessageSendDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.chatService.newMsg(data, this.clients[client.id].pseudo);
    const except_user = await this.chatService.getExceptUser(data.channelId, this.clients[client.id].fortytwo_id);
    let except = await this.server.in(data.channelId.toString()).fetchSockets().then((sockets) => {
      let except_user_socket = [];
      sockets.forEach((socket) => {
        if (except_user.some((user) => user.fortytwo_userName === this.clients[socket.id].fortytwo_userName))
          except_user_socket.push(socket.id);
      });
      return except_user_socket;
    });
    if (chat == null)
      return "error";
    this.server.to(data.channelId.toString()).except(except).emit("Message Created", chat);
  }

  // @SubscribeMessage('joinNewChannel')
  // async join_chan(
  //   @MessageBody() data: JoinChanDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   if (this.clients[client.id] === undefined) {
  //     this.server.to(client.id).emit("error", "Error refresh the page!!!");
  //     return;
  //   }
  //   const user = await this.userService.getUser(this.clients[client.id].fortytwo_userName);
  //   const ret = await this.chatService.join_Chan(data, user);
  //   if (ret === 0 || ret === 5) {
  //     client.join(data.chatId.toString());
  //     if (ret !== 5)
  //       client.to(data.chatId.toString()).emit("NewUserJoin", { username: user.fortytwo_userName, id: user.fortytwo_id, avatarUrl: user.avatar })
  //     this.server.to(client.id).emit("Joined", { chatId: data.chatId });
  //   }
  //   else if (ret == 1)
  //     this.server.to(client.id).emit("error", "NotInvited");
  //   else if (ret == 2)
  //     this.server.to(client.id).emit("error", "Banned");
  //   else if (ret == 3) {
  //     this.server.to(client.id).emit("error", "Wrong password");
  //   }
  //   else {
  //     this.server.to(client.id).emit("error", "This channel does not exist!!!");
  //   }
  // }

  // @SubscribeMessage('JoinChannel')
  // async join(
  //   @MessageBody() data: number,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   if (this.clients[client.id] === undefined)
  //     return;
  //   const user = await this.userService.getUser(this.clients[client.id].fortytwo_userName);
  //   const userIsInChan = await this.chatService.userIsInChan(user.fortytwo_id, data);
  //   if (userIsInChan)
  //     client.join(data.toString());
  //   else {
  //     this.server.to(client.id).emit("error", "You are not in this channel");
  //   }
  // }

  @SubscribeMessage('quit')
  async quit_chan(
    @MessageBody() data: QuitChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const chatInfo = await this.chatService.isDM(data.chatId);
    if (chatInfo) {
      this.server.to(client.id).emit("DM:quit");
      return;
    }
    const quit = await this.chatService.quit_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    client.leave(data.chatId.toString());
    this.server.to(client.id).emit("quited", { chatId: data.chatId });
    this.server.to(data.chatId.toString()).emit("quit", { username: this.clients[client.id].fortytwo_userName })
    // console.log("user quit: " + this.clients[client.id].username);
  }

  @SubscribeMessage('is-admin')
  async isAdmin_Chan(
    @MessageBody() data: IsAdminDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.channel_id);
    // console.log("is admin: " + isAdmin);
    if (isAdmin)
      this.server.to(client.id).emit("isAdmin", { isAdmin: isAdmin });
    else
      this.server.to(client.id).emit("isAdmin", { isAdmin: isAdmin });
  }

  @SubscribeMessage('invit')
  async inv_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.invit_Chan(data.username, data.chatId);
    for (let key in this.clients) {
      if (this.clients[key].fortytwo_userName === data.username) {
        let channel = await this.chatService.get__chanNamebyId(data.chatId);
        this.server.to(key).emit("invited", { chatId: data.chatId, name: channel.name })
        return;
      }
    }
    // console.log("user invited");
  }

  @SubscribeMessage('ban')
  async ban_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.ban_Chan(data.username, data.chatId);
    for (let key in this.clients) {
      if (this.clients[key].fortytwo_userName === data.username) {
        this.server.fetchSockets().then(
          (sockets) => {
            sockets.find((socket) => socket.id === key).leave(data.chatId.toString());
          }
        );
        this.server.to(key).emit("banned", { chatId: data.chatId });
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("ban", { username: data.username });
    // console.log("chan banned");
  }

  @SubscribeMessage('unban')
  async unban_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    // console.log(data);
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.unban_Chan(data.username, data.chatId);
    for (let key in this.clients) {
      if (this.clients[key].fortytwo_userName === data.username) {
        this.server.to(key).emit("unbanned", { chatId: data.chatId });
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("unban", { username: data.username });
    // console.log("chan unbanned");
  }

  @SubscribeMessage('kick')
  async kick_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.kick_Chan(data.username, data.chatId);
    for (let key in this.clients) {
      if (this.clients[key].fortytwo_userName === data.username) {
        if (this.clients[key].fortytwo_userName === data.username) {
          this.server.fetchSockets().then(
            (sockets) => {
              sockets.find((socket) => socket.id === key).leave(data.chatId.toString());
            }
          );
        }
        this.server.to(key).emit("kicked", { chatId: data.chatId });
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("kick", { username: data.username });
    // console.log("chan kicked");
  }


  @SubscribeMessage('mute')
  async mute_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.mute_Chan(data.username, data.chatId);
    this.server.to(data.chatId.toString()).emit("mute", { username: data.username });
    // console.log("chan muteed");
  }


  @SubscribeMessage('unmute')
  async unmute_chan(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.unmute_Chan(data.username, data.chatId);
    this.server.to(data.chatId.toString()).emit("unmute", { username: data.username });
    // console.log("chan unmuteed");
  }

  @SubscribeMessage('set-admin')
  async set_admin(
    @MessageBody() data: ActionsChanDto,
    @ConnectedSocket() client: Socket,) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].fortytwo_userName, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.set_admin_Chan(data.username, data.chatId);
    this.server.to(data.chatId.toString()).emit("set-admin", { username: data.username });
    // console.log("new admin");
  }

  @SubscribeMessage('update')
  async update_chan(
    @MessageBody() data: EditChannelCreateDto,
    @ConnectedSocket() client: Socket,
  ) {

    const res: number = await this.chatService.update_chan(data);
    if (res == 1)
      client.broadcast.emit('Password is empty but chan need password', data);
    else if (res == 2)
      client.broadcast.emit('not an admin', data);
    else
      client.broadcast.emit('chan updated', data);
  }

  // @SubscribeMessage('play')
  // async playMatchWithFriends(@ConnectedSocket() client: Socket, @MessageBody() data: PlayChanDto) {
  //   const room = await this.chatService.playMatchWithFriends(client, this.clients[client.id].fortytwo_userName, data.chatId, this.server);
  //   setTimeout(async () => {
  //     this.server.to(client.id).emit("NewPartyCreated", room.name);
  //     const msg = await this.chatService.newMsg({ chatId: data.chatId, msg: "Link to Play with me:\n" + `${process.env.FRONTEND_URL}` + "/Game/" + room.name }, this.clients[client.id].fortytwo_id);
  //     this.server.to(data.chatId.toString()).emit("NewMessage", msg);
  //   }, 2000);
  // }

  private findSocketIdByUserId(userId: number): string | undefined {
    return Object.keys(this.clients).find((id) => this.clients[id]?.fortytwo_id === userId);
  }

  async emitSignal(userId: number, obj: any, signal: string) {
    const userSocketId = this.findSocketIdByUserId(userId)

    if (userSocketId) {
      this.server.to(userSocketId).emit(signal,  obj);
    }
  }

  // async addFriends(me: User, friendPseudo: string): Promise<backResInterface> {
  //   const meFriends = (await this.prisma.user.findUnique({
  //     where: { fortytwo_id: me.id },
  //     select: { friends: true }
  //   })).friends;
  //   const friendId = (await this.prisma.user.findFirst({
  //     where: { pseudo: friendPseudo },
  //     select: { fortytwo_id: true }
  //   })).fortytwo_id;

  //   if (!meFriends?.find(meFriend => meFriend === friendId) && me.id != friendId) {
  //     const mePrisma = await this.prisma.user.update({
  //       where: { fortytwo_id: me.id },
  //       data: { friends: { push: friendId } }
  //     });
  //     console.log("addfriends result : ", mePrisma.friends);

  //     const friend = await this.userService.getUserbyId(friendId);
  //     this.server.to(this.clients[me.id]).emit("New Friends", { friend });

  //     return { isFriend: true };
  //   } else if (me.id != friendId) {
  //     console.log('you can not friend yourself\n');
  //   } else {
  //     console.log('already friend\n');
  //   }
  //   return { isFriend: false };
  // }
}
