import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';


// Todo : friendship Created
// Todo : Ichannel repartition seems incorrect on reception of event Channel Created
// Todo : emit messages : might be type (message: string, channel : Ichannels);
// Todo : creat interface and fonction to emit ban/mute/ user
// Todo : update channels (change password, name new admin ....)
// Todo : see how to send admins info to Garance.
// Todo : see if not better to not open window when new channel is created but to have an other color on screen ?
// todo : if channel was in channelsToJoin, I need to put it in my channels.
// Todo : addFriendToChannel


// *npx prisma generate

// some code that can still be usefull
//case channel id already exist in list: need to update info
// else {
//   setChannels((prev) => ({
//   ...prev!,
//   MyDms: prev?.MyDms?.map((channel) => (channel.id === newChat.id ? newChat : channel)) || [],
//   }));
// }
// break;

  export interface IChatMember {
    name: string;
    id: number;
    connected?: boolean;
    // status; // owner, admin, user
  }

export interface IChatHistory {
  id: number,
  owner: {
    name: string,
    id: number,
  };
  content: string;
}

export interface IChatWindow extends IChannel{
  history: IChatHistory[];
}

export interface IChannel {
  id: number,
  name: string,
  type: string,
  members: IChatMember[],
}

type ChannelType = keyof IChannels;
export interface IChannels{
	MyDms: IChannel[];
	MyChannels: IChannel[];
	ChannelsToJoin : IChannel[];
  }

export interface IFormData {
  name: string,
  isPrivate: boolean,
  isPassword: boolean,
  password: string,
  members: IChatMember[],
  type: string,
}

export const ChatContext = createContext<{
  socket: Socket | null
  channels: IChannels
  openedWindows: IChatWindow[] | null
  openWindow: (chatData? : IChannel, form?: IFormData, password?: string) => void
  closeWindow: (id: number) => void
  sendMessage: (message: string, channelId: number) => void
  sendAdminForm: (chatId: number, targetPseudo: string,
                  mute: boolean, unMute: boolean,
                  ban: boolean, unBan: boolean,
                  kick: boolean, admin: boolean,
                  isPassword: boolean, password: string) => void
  addFriendToChannel: (nameToAdd: string, chatId: number) => void
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channels, setChannels ] = useState<IChannels>({MyDms: [], MyChannels: [], ChannelsToJoin: []});
  const [openedWindows, setOpenedWindows] = useState<IChatWindow[]>([])

  /*********** init chat Context ************/
  const socketRef = useRef<Socket | null>(null);
  const initChatCtx = () => {
    const token = Cookies.get('jwtToken');
    if (!token)
      return
    const newSocket = io('http://localhost:3333/chat', {
      auth: {
        token: token
      }
    });
    newSocket.on('connect', () => {
      setSocket(newSocket);

      backRequest('chat/channels', 'GET').then((data) => {
        console.log("chat/channels route is giving : ", data, "\n");
        let allChannels : IChannels = data.data as IChannels
        allChannels = moveMemberToFirstInIChannels(allChannels, "MyDms", user?.fortytwo_id || 0)
        allChannels = moveMemberToFirstInIChannels(allChannels, "MyChannels", user?.fortytwo_id || 0)
        allChannels = moveMemberToFirstInIChannels(allChannels, "ChannelsToJoin", user?.fortytwo_id || 0)
        allChannels && setChannels(allChannels);
      })

      // newSocket?.on('friendConnected', (friend) => {
      //   setChannels((prev) => {
      //     ...prev,

      //   })
      // });
      // newSocket?.on('friendDisconnected', (friend) => {
      //   setDisconnectedFriends((prev) => [...prev, friend]);
      //   setConnectedFriends((prev) => prev.filter((f) => f !== friend));
      // });

      newSocket?.on('Message Created', (message) => {
        console.log("\n\n\nMessage Created", message);
        //add message in the right conversation.
      })

      /* *********************************************************
          * Channel Created :
            - reformat members so current user is on top
            - add Channel to the right place in channels:IChannels
      ***********************************************************/
      newSocket?.on('Channel Created', (newChannel : IChannel) => {
        console.log("channel created signal recieved: \n\n\n", newChannel);
        handleEventChannelCreated(newChannel);
      });

      /* *********************************************************
          * friendship Created :
            - reformat members so current user is on top
            - add Channel to the right place in channels:IChannels
            - emit back so socket .join can be run
      ***********************************************************/
      newSocket?.on('friendship Created', (newChannel : IChannel) => {
        console.log("friendship Created recieved: \n\n\n", newChannel);
        handleEventChannelCreated(newChannel);
        newSocket?.emit("Join Channel", newChannel)
      });

      /* *********************************************************
          * Channel Joined :
            - if new channel joined, open channel window
      ***********************************************************/
      newSocket?.on('Channel Joined', (newChat: IChannel) => {
        // todo : if channel was in channelsToJoin, I need to put it in my channels.
        console.log("channel Joined signal received\n");
        handleOpenWindow(newChat);
      });

      socketRef.current = newSocket;
    })
    newSocket.on('disconnect', () => {
      console.log('Socket Disconnected from server');
      // TODO: ajouter logique de gestion déconnexion
       socketRef.current?.off('friendConnected');
       socketRef.current?.off('friendDisconnected');
       socketRef.current?.off('channelUpdate');
       socketRef.current?.disconnect();
       socketRef.current = null;
    });
  }

  useEffect(() => {
    if (user?.isAuthenticated && !socket?.connected) {
      initChatCtx();
    }
    else if (!user?.isAuthenticated  && socket?.connected) {
      console.log("deleting socket useState Socket : ",user, socket);
      socketRef.current?.disconnect();
      setSocket(null)
    }
  }, [user])


  /*********** chat window states ************/

  // const updateChannels = (newChat : IChannel) => {
  //   if (isChannelKnown(newChat.id, newChat.type))
  //   {

  //   }
  // }

      /* *********************************************************
          * moveMemberToFirst && moveMemberToFirstInIChannels:
            - moves specific member to first position in the channel
              if (found && not already first)
      ***********************************************************/
  const moveMemberToFirst = (members: IChatMember[], targetMemberId: number): IChatMember[] => {
    const targetIndex = members.findIndex(member => member.id === targetMemberId)
    if (targetIndex > 0) {
      const [removedMember] = members.splice(targetIndex, 1);
      members.unshift(removedMember);
    }
    return members;
  }

  const moveMemberToFirstInIChannels = (channels: IChannels, channelType: ChannelType, targetMemberId: number) => {
    const updatedIChannel = channels[channelType].map(channel => ({
      ...channel,
      members: moveMemberToFirst(channel.members, targetMemberId),
    }));
    return { ... channels, [channelType] : updatedIChannel};
  }

      /* *********************************************************
          * findIdInList
            - usage : if(findIdInList(channels[newChannel.type], newChannel.id))
              --> check if channels[key] contains
      ***********************************************************/
  const findIdInList = <T extends { id: number }>(list?: T[], idToFind?: number): T | undefined => {
    const foundElem = list?.find(elem => elem.id === idToFind);
    return foundElem;
  };

      /* *********************************************************
          * isChannelKnown
            - usage : if (usChannelKnown("MyDms", 42))
              --> check if MyDms has a channel of id 42
      ***********************************************************/
  const isChannelKnown = (channelKey: string, idToFind?: number) => {
    if (!idToFind)
      return false;
    return channels?.[channelKey]?.find((channel: IChannel) => channel.id === idToFind);
  };


      /* *********************************************************
          * ischatOpenned
            - usage : if (ischatOpenned(26))
              --> check if chat of id 26 is in openedWindows
      ***********************************************************/
  const ischatOpenned = (idTofind: number) => {
    return openedWindows?.find((openedWindow: IChatWindow) => openedWindow.id === idTofind)
  }

      /* *********************************************************
          * handleEventChannelCreated
            - usage : called after recieving event 'Channel Created && Friendship Created'
              --> reformat members so current user is on top
              --> add Channel to the right place in channels:IChannels
      ***********************************************************/
  const handleEventChannelCreated = (newChannel : IChannel) => {
    if (user)
      newChannel.members = moveMemberToFirst(newChannel.members, user.fortytwo_id || 0)
    // console.log("newChannel.members new order is  = ", newChannel.members)
    addChannelToChannelsByType(channels, newChannel)
    // else
      // console.log("channels seems to be null");
  }

  const addChannelToChannelsByType = (channels: IChannels, newChannel: IChannel) => {

    if (newChannel.type == "MyChannels" && !newChannel.members.find(member => member.id === user?.fortytwo_id))
      newChannel.type = "ChannelsToJoin";

    console.log("inside addChannelToChannelsByType, newChannel = ", newChannel.type)
    // if newChannel is not already in my list
    // if(!findIdInList(channels[newChannel.type], newChannel.id)) {
    if(!isChannelKnown(newChannel.type, newChannel.id)) {
      setChannels((prev) => ({
        ...prev!,
        [newChannel.type]: prev ? [...prev[newChannel.type], newChannel] : [newChannel],
      }))
    }
    else
      console.log("addChannelToChannelsByType, channel seems to be known")
  }

      /* *********************************************************
          * handleOpenWindow
            - usage : handleOpenWindow(ChannelToOpen)
              --> turn Ichannel into IchatWindow (Ichannel + message history )
      ***********************************************************/
  const handleOpenWindow = async (chatData : IChannel) =>{
    if (!ischatOpenned(chatData.id)){
      // if user is not
      if (chatData.type === 'ChannelsToJoin')
        socket?.emit("Join Channel", chatData)

      const newWindow: IChatWindow = (await (backRequest('chat/chatWindow/' + chatData.id, 'GET'))).data
      newWindow.id = chatData.id;
      newWindow.name = chatData.name;
      newWindow.type = chatData.type;
      newWindow.members = chatData.members;
      setOpenedWindows(current => {return([...current || [], newWindow])})

    }
  }


  useEffect (() => {console.log("new openned window set : ", openedWindows)}, [openedWindows])
  useEffect (() => {console.log("new newChannels set : ", channels)}, [channels])
  useEffect (() => {if (channels?.MyDms.length) console.log("new newChannels set in MyDms: ", channels?.MyDms)}, [channels?.MyDms])

  const closeWindow = (id : number) => {
    console.log("closeWindow called \n", id);
    setOpenedWindows((prev) => prev ? prev.filter((f) => f.id !== id) : []);
  }

  const openWindow = async (chatData? : IChannel, form?: IFormData, password?: string) => {
    const data = {
      id:          chatData?.id?      chatData.id      :  undefined,
      name:        form?.name?        form.name        :  chatData?.name,
      type:        form?.type?        form.type        :  chatData?.type,
      members:     form?.members?     form.members     :  chatData?.members,
      isPrivate:   form?.isPrivate?   form.isPrivate   :  false,
      isPassword:  form?.isPassword?  form.isPassword  :  false,
      password:    form?.password?    form.password    :  "",
    }
    // if unknown, emit JoinChannel, chan creation and join channel will be done elsewhere
    if (data.type && !isChannelKnown(data.type, data.id)) {
      console.log("openWindoc called : data = ", data);
      console.log("socket = ", socket);
      socket?.emit('Join Channel', data)
    }
    // if channel is known, open window directly
    else if (chatData)
      handleOpenWindow(chatData);
  }

  const sendMessage = (message: string, channelId: number) => {
    if (message)
      socket?.emit('sendMessage', {message: message, channelId: channelId})
  }

  const sendAdminForm = (chatId: number, targetId: number,
                         mute: boolean, unMute: boolean,
                         ban: boolean, unBan: boolean,
                         kick: boolean, admin: boolean,
                         isPassword: boolean, password: string) => {
    if (mute)
      socket?.emit('mute', {chatId: chatId, userId: targetId});
    else if (unMute)
      socket?.emit('unmute', {chatId: chatId, userId: targetId});
    if (ban)
      socket?.emit('ban', {chatId: chatId, userId: targetId});
    else if (unBan)
      socket?.emit('unban', {chatId: chatId, userId: targetId});
    if (kick)
      socket?.emit('kick', {chatId: chatId, userId: targetId});
    if (admin)
      socket?.emit('set-admin', {chatId: chatId, userId: targetId});
    if (isPassword) // TODO add change pwd
      socket?.emit('set-admin', {chatId: chatId, userId: targetId});
  }

  const addFriendToChannel = (nameToAdd: string, chatId: number) => {
    let userId: number;
    backRequest('users/isFriend/' + nameToAdd, 'GET').then(data => {
      if (!data.isFriend)
        return;
      else
        backRequest('users/user', 'PUT', {pseudo: nameToAdd}).then(data => {
          userId = data.fortytwo_id;
        })
    })
    socket?.emit('invit', {chatId: chatId, userId: userId});
  }

  /*********** return ctx ************/
  return (
    <ChatContext.Provider value={{ socket, channels, openedWindows, openWindow, closeWindow, sendMessage, sendAdminForm, addFriendToChannel }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a UserProvider');
  }
  return context;
};
