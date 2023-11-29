import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelCreateDto } from './dto/chat.dto';
import { ChannelMessageSendDto } from './dto/msg.dto';
import { updateChat } from './chat.type';
import { UserService } from 'src/user/user.service'
import { Channel, User, Message, PrismaClient } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { JoinChanDto, EditChannelCreateDto } from 'src/chat/dto/edit-chat.dto';
import { channel } from 'diagnostics_channel';
import { use } from 'passport';
import { Server, Socket } from 'socket.io';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly auth: AuthService,
  ) { }

  async getUserFriends(pseudo: string) {
    const user = await this.prisma.user.findFirst({
      where: { pseudo: pseudo },
      select: { friends: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const friends = await this.prisma.user.findMany({
      where: { pseudo: { in: user.friends.map(String) } },
      select: { pseudo: true }
    });

    return friends.map(friend => friend.pseudo);
  }

  async getUserByPseudo(pseudo: string) {
    const users = await this.prisma.user.findMany({
      where: {
        pseudo: pseudo,
      }
    });
    return users[0];
  }

  async getChan(chatName: string) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        chatName: chatName,
      },
    });

    if (!channel) {
      return null;
    }

    return channel;
  }

  async CreateChan(info: ChannelCreateDto, pseudo1: string, pseudo2: string = null) {
    let hash = null;
    info.isPassword = false;
    if (info.Password != null && info.Password != undefined && info.Password != "") {
      const salt = crypto.randomBytes(16).toString('hex');
      hash = await bcrypt.hash(info.Password, 10);
      info.isPassword = true;
    }

    if (info.isPrivate === undefined)
      info.isPrivate = false;

    const user1 = await this.getUserByPseudo(pseudo1);
    let membersToConnect = [{ fortytwo_id: user1.fortytwo_id }];
    let user2 = null;
    if (pseudo2) {
      user2 = await this.getUserByPseudo(pseudo2);
      membersToConnect.push({ fortytwo_id: user2.fortytwo_id });
    }
    const channel = await this.prisma.channel.create({
      data: {
        name: info.chatName,
        password: hash,
        isPrivate: info.isPrivate,
        isPassword: info.isPassword,
        isDM: pseudo2 ? true : false,
        owner: {
          connect: {
            fortytwo_id: user1.fortytwo_id,
          }
        },
        admins: {
          connect: {
            fortytwo_id: user1.fortytwo_id,
          }
        },
        members: {
          connect: membersToConnect
        }
      }
    });
    return channel;
  }

  async delChanById(id: number) {
    const chan = await this.prisma.channel.delete(
      {
        where: {
          id: id,
        },
      }
    )
  }

  async quit_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const value = await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        members: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async invit_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        invited: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async ban_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        admins: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        members: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        muted: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        banned: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async unban_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        banned: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        members: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async kick_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        admins: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        members: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
        muted: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }


  async mute_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        muted: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async set_admin_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        admins: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }



  async unmute_Chan(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_userName: username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        muted: {
          disconnect: {
            fortytwo_id: user.fortytwo_id,
          },
        },
      },
    });
  }

  async join_Chan(data: JoinChanDto, user: User) {
    const isInChan = await this.userIsInChan(user.fortytwo_id, data.chatId);
    if (isInChan)
      return (5);
    const chan = await this.prisma.channel.findUnique({
      where: {
        id: data.chatId,
      },
      select: {
        isPrivate: true,
        isPassword: true,
        banned: true,
        password: true,
        invited: true,
      }
    })
    if (chan === null)
      return (4);
    const isban = chan.banned.find(banned => banned.fortytwo_id == user.fortytwo_id)
    const isinvit = chan.invited.find(invited => invited.fortytwo_id == user.fortytwo_id)
    const isPriv = chan.isPrivate;
    if (isPriv || isban) {
      if (isPriv && !isinvit)
        return (1);
      else if (isban)
        return (2);
    }
    else if (chan.password !== '' && chan.password !== null && chan.password !== undefined) {
      // console.log("chan pass : ", chan.password, "data pass : ", data.Password);
      const isMatch = await bcrypt.compare(data.Password, chan.password);

      // console.log("is mathc ? " + isMatch);

      if (!isMatch)
        return (3);
    }
    await this.prisma.channel.update(
      {
        where: {
          id: data.chatId,
        },
        data: {
          members: {
            connect: {
              fortytwo_id: user.fortytwo_id,
            },
          },
        },
      }
    )
    if (isinvit)
      await this.prisma.channel.update(
        {
          where: {
            id: data.chatId,
          },
          data: {
            invited: {
              disconnect: {
                fortytwo_id: user.fortytwo_id,
              },
            },
          },
          //isPrivate : info.Private,
        }
      )
    return (0);
  }

  async isBan_Chan(username: string, id: number) {
    const chan = await this.prisma.channel.findFirst({
      where: {
        id: id,

      },
      select: {
        banned: true,
      }
    })
    const isban: User = chan.banned.find(banned => banned.fortytwo_userName == username)
    if (isban)
      return (true)
    else
      return (false)
  }

  async isAdmin_Chan(username: string, id: number) {
    const chan = await this.prisma.channel.findFirst({
      where: {
        id: id,

      },
      select: {
        admins: true,
      }
    })
    const isad: User = chan.admins.find(admins => admins.fortytwo_userName == username)
    if (isad)
      return (true)
    else
      return (false)
  }

  async newMsg(info: ChannelMessageSendDto, pseudo: string) {
    const channelid = info.channelId;
    const user = await this.getUserByPseudo(pseudo);
    if (!user) {
      throw new Error(`User with pseudo ${pseudo} not found`);
    }
    const isInChan = await this.userIsInChan(user.fortytwo_id, channelid);
    const isMuted = await this.userIsChanMuted(user.fortytwo_id, channelid);
    if (!isInChan || isMuted) {
      return (null);
    }
    const message = await this.prisma.message.create({
      data: {
        owner: {
          connect: {
            fortytwo_id: user.fortytwo_id,
          }
        },
        channel: {
          connect: {
            id: info.channelId,
          }
        },
        message: info.message,
      },
      select: {
        id: true,
        owner: {
          select: {
            avatar: true,
            pseudo: true,
          }
        },
      }
    });

    return (message);
  }

  async get__channelsUserCanJoin(token: string) {
    try {
      const source = await this.prisma.channel.findMany({
        where: {
          OR: [
            {
              isPrivate: false
            },
            { invited: { some: { refresh_token: token } } },
          ],
          AND: {
            members: { none: { refresh_token: token } },
            banned: { none: { refresh_token: token } },
          }
        },
        select: {
          id: true,
          name: true,
        },
      });
      return source;
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async get__channelsUserIn(token: string) {
    try {
      const source = await this.prisma.channel.findMany({
        where: {
          members: { some: { refresh_token: token } },
          isDM: false,
        },
        select: {
          id: true,
          name: true,
        },
      });
      return source;
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async get__DmUser(token: string) {
    try {
      const source = await this.prisma.channel.findMany({
        where: {
          members: { some: { refresh_token: token } },
          isDM: true,
        },
        select: {
          id: true,
          members: {
            where: {
              NOT: { refresh_token: token },
            },
            select: {
              fortytwo_userName: true,
            }
          }
        },
      });
      return source;
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async get__allUserInchan(id: number) {
    try {
      const source = await this.prisma.channel.findUnique({
        where: {
          id: id,
        },
        select: {
          members: true,
        },
      });
      return source.members;
    } catch (error) {
      console.log('get__user error:', error);
    }
  }

  organize__channelToJoin(source: any) {
    const channels = [];
    // console.log("source : ", source)
    // console.log("name : ", source.name)
    // console.log("source size : ", source.contains)
    // console.log("member : ", source.member)

    return channels;
  }

  async get__UserIn(idChan: number) {
    const users = await this.prisma.user.findMany({
      where: {
        fortytwo_id: idChan,
      },
      include: {
        userChannels: {
          include: {
            channel: true,
          },
        },
      },
    });
    return users;
  }

  async get__chanNamebyId(id: number) {
    try {
      const source = await this.prisma.channel.findUnique({
        where: {
          id: id,
        },
        select: {
          name: true,
        },
      });
      return source
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async getChannelById(idChan: number) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: idChan,
      },
      include: {
        admins: true, // include 'admins' in the query
        members: true, // include 'members' in the query
        muted: true, // include 'muted' in the query
        banned: true, // include 'banned' in the query
      },
    });
    return channel;
  }

  async getChannelProtection(id: number) {
    try {
      const source = await this.prisma.channel.findUnique({
        where: {
          id: id,
        },
        select: {
          password: true,
          members: true,
        },
      });
      return source
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async get__MsgIn(idChan: number, blockedUser: number[]) {
    const messages = await this.prisma.channel.findUnique({
      where: {
        id: idChan,
      },
      include: {
        messages: true, // include 'messages' in the query
      },
    });
    return messages;
  }

  async getUserBanIn(id: number) {
    try {
      const source = await this.prisma.channel.findMany({
        where: {
          id: id,
        },
        select: {
          banned: true,
        },
      });
      return source;
    } catch (error) {
      console.log('get__channels error:', error);
    }
  }

  async update_chan(info: EditChannelCreateDto) {

    const idchat = info.channelid;
    // if (info.isPrivate == undefined)
    //   info.isPrivate = false;
    // const isPass = info.isPassword.valueOf();
    let hash = "";
    if (info.Password != undefined && info.Password != null && info.Password != "") {
      const salt = await bcrypt.genSalt();
      hash = await bcrypt.hash(info.Password, salt);
      // console.log("hash updated !:" + hash);
      info.isPassword = true;
    }
    else {
      // console.log("IS PASSWORD NULL ?");
      info.isPassword = false;
    }
    // console.log("isPass : ", isPass);
    if (await this.isAdmin_Chan(info.username, info.channelid) == true) {
      if (info.isPassword)
        if (!info.Password)
          return (1);
      if (hash == "")
        hash = null;
      await this.prisma.channel.update(
        {
          where: {
            id: idchat,
          },
          data: {
            password: hash,
            isPassword: info.isPassword,
            // isPrivate : info.isPrivate,
            //isPrivate : info.Private,
          }
        }
      )
      // if (info.newname)
      // {
      //   await this.prisma.channel.update(
      //     {
      //       where: {
      //         id: idchat,
      //       },
      //       data: {
      //         name : info.newname,
      //       },
      //     }
      //   )
      // }
      return (0);
    }
    else
      return (2);
  }

  async userIsInChan(fortytwo_id: number, id_channel: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: fortytwo_id
      },
      select: {
        members: true
      }
    });

    if (!user) {
      throw new Error(`User with fortytwo_id ${fortytwo_id} not found`);
    }

    for (let i = 0; i < user.members.length; i++) {
      if (user.members[i].id === id_channel)
        return true;
    }
    return false;
  }

  async userIsChanMuted(fortytwo_id: number, id_channel: number): Promise<boolean> {
    const channels = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: fortytwo_id
      },
      select: {
        muted: true
      }
    })
    for (let i = 0; i < channels.muted.length; i++) {
      if (channels.muted[i].id === id_channel)
        return true;
    }
    return false;
  }

  async getUsername(token: string) {
    return this.prisma.user.findUnique({
      where: {
        fortytwo_id: Number(token),
      },
      select: {
        fortytwo_userName: true,
        fortytwo_id: true,
      },
    });
  }

  async getPeopleToInvite(token: string, channelId: number) {
    const friends = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: Number(token),
      },
      select: {
        friends: true,
      },
    });

    const userToInvite = friends.friends.map(async (id_user: number) => {
      const user = await this.prisma.user.findUnique({
        where: {
          fortytwo_id: id_user,
        },
        select: {
          fortytwo_userName: true,
          admins: {
            select: {
              id: true,
            }
          },
          members: {
            select: {
              id: true,
            }
          },
          muted: {
            select: {
              id: true,
            }
          },
          banned: {
            select: {
              id: true,
            }
          },
        },
      });
      if (user.admins.find((elem: any) => { return elem.id === channelId }) === undefined &&
        user.members.find((elem: any) => { return elem.id === channelId }) === undefined &&
        user.muted.find((elem: any) => { return elem.id === channelId }) === undefined &&
        user.banned.find((elem: any) => { return elem.id === channelId }) === undefined
      ) {
        return user.fortytwo_userName;
      }
      return;
    })
    return Promise.all(userToInvite);
  }

  async getUserToDm(token: string) {
    const useralreadydm = await this.prisma.channel.findMany({
      where: {
        members: {
          some: { fortytwo_id: Number(token) }
        },
        isDM: true,
      },
      select: {
        members: {
          where: {
            NOT: { fortytwo_id: Number(token) }
          },
          select: {
            fortytwo_userName: true,
          }
        }
      }
    })

    // console.log(useralreadydm);
    let usernames = [];
    if (useralreadydm.length > 0) {
      useralreadydm[0].members.forEach((value: any) => {
        usernames.push(value.username);
      })
    }
    const users = await this.prisma.user.findMany({
      where: {
        AND: {
          fortytwo_userName: {
            notIn: usernames,
          },
          NOT: { fortytwo_id: Number(token) }
        }
      },
      select: {
        fortytwo_userName: true,
      }
    })
    // console.log(users);
    let values = []
    users.forEach((value: any) => {
      values.push(value.username);
    })
    return (values);
  }

  async createDmChannel(username1: string, username2: string) {
    const channel = await this.prisma.channel.create({
      data: {
        name: username1 + "," + username2,
        password: '',
        isPrivate: true,
        isDM: true,
        owner: {
          connect: { fortytwo_userName: username1 }
        },
        admins: {
          connect: [{ fortytwo_userName: username1 }, { fortytwo_userName: username2 }]
        },
        members: {
          connect: [{ fortytwo_userName: username1 }, { fortytwo_userName: username2 }]
        }
      }
    });
    return channel;
  }

  async isDM(channelId: number) {
    const value = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        isDM: true,
      }
    })
    return value.isDM;
  }

  async getUserBlocked(token: string) {
    const usersBlocked = await this.prisma.user.findUnique({
      where: {
        fortytwo_id: Number(token),
      },
      select: {
        blocked: true,
      }
    })
    return usersBlocked.blocked;
  }

  async getExceptUser(channelId: number, id_user: number) {
    const users = await this.prisma.user.findMany({
      where: {
        blocked: {
          has: id_user,
        },
        OR: [
          { ownerId: channelId },
        ],
      },
      select: {
        fortytwo_userName: true,
      }
    });
    return users;
  }


  /******************************************* */
  /** fonction ajoute pour remanier le front  */
  /***************************************** */

  private pwdCheck(channel: Channel, pwd: string) {
    channel.password == pwd ? true : false;
  }

  private membershipCheck(chanMembers: {pseudo: string}[], userName: string){
      return chanMembers.find(member => member.pseudo === userName) ? true : false;
  }

  async getChannelInfo(channelId: number, user: User) {

    const channel = await this.prisma.channel.findUnique({
      where: {
        id:channelId
      },
      select: {
        members: {select: {pseudo: true, }},
        messages: {select:{
          message: true,
          owner:{select:{pseudo: true}}
        }},
      }
    });
    return channel && this.membershipCheck(channel.members, user.pseudo)
                  ? {id : channelId,members:channel.members, history: channel.messages}
                  : {};
    // in case I decide to formate the informations :
    // const chatHistory = channel?.messages.map(messages => ({
    //     owner:messages.owner.pseudo,
    //     messages: messages.message,
    // })) || []
    // return {members:channel.members, history: chatHistory }
  }
}

