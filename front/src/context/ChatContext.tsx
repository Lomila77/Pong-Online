import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';


// Todo : function that removes my self from users
// Todo : const closeWindow(windowId)
// Todo : update channels (change password, name new admin ....)

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
  // connected?: boolean //will be set only if friends tab
  // friendInfo?: number
}

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

const ChatContext = createContext<{
  socket: Socket | null
  // friends: IChannel[]
  channels: IChannels | null
  openedWindows: IChatWindow[] | null
  openWindow: (chatData? : IChannel, form?: IFormData, password?: string) => void
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  // const [friends, setFriends] = useState<IChannel[]>([])
  const [channels, setChannels ] = useState<IChannels | null>(null);
  const [openedWindows, setOpenedWindows] = useState<IChatWindow[]>([])

  // const [openedWindows, setOpenedWindows] = useState<Map<number, IChatWindow> >()

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
      // backRequest('chat/friends', 'GET').then((data) => {
      //   console.log("friends route is giving : ", data, "\n");
      //   data.data && setFriends(data.data as IChannel[]);
      // })
      backRequest('chat/channels', 'GET').then((data) => {
        console.log("channels route is giving : ", data, "\n");
        data.data && setChannels(data.data as IChannels);
      })
      // newSocket?.on('New Friends', (friend) => {
      //   setFriends((prev) => [...prev, friend])
      // })
      // newSocket?.on('friendConnected', (friend) => {
      //   setConnectedFriends((prev) => [...prev, friend]);
      //   setDisconnectedFriends((prev) => prev.filter((f) => f !== friend));
      // });
      // newSocket?.on('friendDisconnected', (friend) => {
      //   setDisconnectedFriends((prev) => [...prev, friend]);
      //   setConnectedFriends((prev) => prev.filter((f) => f !== friend));
      // });
      newSocket?.on('sendMessage', (message) => {
        //add message in the right conversation.
      })

      newSocket?.on('Channel Created', (newChat : IChannel) => {
        // todo : need a less repetitive way to do this
        console.log("Channel Created signal received newChat =", newChat, "\n");

        switch (newChat.type) {
          case "MyDms" :
            if(!findIdInList(channels?.MyDms, newChat.id)) {
              setChannels((prev) => ({
                ...prev!,
                MyDms: prev ? [...prev.MyDms, newChat] : [newChat],
              }));
            }
          default :
            if (newChat.members.find(member => member.name === user?.pseudo)) {
              newChat.type = "MyChannels"
              setChannels((prev) => ({
                ...prev!,
                MyChannels: prev ? [...prev.MyChannels, newChat] : [newChat],
              }));
            }
            else
              newChat.type = "ChannelsToJoin"
              setChannels((prev) => ({
                ...prev!,
                ChannelsToJoin: prev ? [...prev.ChannelsToJoin, newChat] : [newChat],
              }));
            break;
        }
      });

      newSocket?.on('Channel Joined', (newChat: IChannel) => {
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

  const findIdInList = <T extends { id: number }>(list?: T[], idToFind?: number): T | undefined => {
    const foundElem = list?.find(elem => elem.id === idToFind);
    return foundElem;
  };

  const isChannelKnown = (type: string, idToFind?: number) => {
    if (!idToFind)
      return false;
    return channels?.[type]?.find((channel: IChannel) => channel.id === idToFind);
  };

  const ischatOpenned = (idTofind: number) => {
    return openedWindows?.find((openedWindow: IChatWindow) => openedWindow.id === idTofind)
  }

  const handleOpenWindow = async (chatData : IChannel) =>{
    if (!ischatOpenned(chatData.id)){
      console.log("chat is not openned yet\n", chatData)
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

  // const handleCloseWindow = (id : string) => {
  //   const closingWingow: IChatWindow = {
  //     id: '',
  //     members: [],
  //     history: [],
  //   }
  //   setOpenedWindows((prev) => prev ? prev.filter((f) => f !== closingWingow) : []);
  // }

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


  /*********** return ctx ************/
  return (
    <ChatContext.Provider value={{ socket, /*friends, connectedFriends, disconnectedFriends,*/ channels, openedWindows, openWindow }}>
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
