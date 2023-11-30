import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IChannel, IChannels, backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';

export interface IChatFriend {
  id: number
  name: string
  connected: boolean
}

export interface IChatHistory {
  owner: {
    pseudo: string
  };
  content: string;
}

export interface IChatWindow {
  id: number;
  type: string;
  name: string;
  members: string[];
  history: IChatHistory[];
}

const ChatContext = createContext<{
  socket: Socket | null
  friends: IChatFriend[]
  connectedFriends: string[]
  disconnectedFriends: string[]
  channels: IChannels | null
  openedWindows: IChatWindow[] | null
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<IChatFriend[]>([])
  const [connectedFriends, setConnectedFriends] = useState<string[]>([])
  const [disconnectedFriends, setDisconnectedFriends] = useState<string[]>([])
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
      backRequest('chat/friends', 'GET').then((data) => {
        console.log("getfriends \n", data);
        data.friends && setFriends(data.friends);
      })
      backRequest('chat/channels', 'GET').then((data) => {
        console.log(data);
        data.channels && setChannels(data.channels);
      })
      newSocket?.on('friendConnected', (friend) => {
        setConnectedFriends((prev) => [...prev, friend]);
        setDisconnectedFriends((prev) => prev.filter((f) => f !== friend));
      });
      newSocket?.on('friendDisconnected', (friend) => {
        setDisconnectedFriends((prev) => [...prev, friend]);
        setConnectedFriends((prev) => prev.filter((f) => f !== friend));
      });
      newSocket?.on('sendMessage', (message) => {
        //add message in the right conversation.
      })
      newSocket?.on('Channel Created', (newChat : IChatWindow) => {
        const newChannel : IChannel = {id: newChat.id, name: newChat.name}
        /* update channels state  */
        switch (newChat.type){
          case 'dm' :
            setChannels((prev) => ({
              ...prev!,
              MyDms: prev ? [...prev.MyDms, newChannel] : [newChannel],
            }));
            break;
          case 'private' :
            setChannels((prev) => ({
              ...prev!,
              MyDms: prev ? [...prev.MyChannels, newChannel] : [newChannel],
            }));
            break;
          case 'public' :
            setChannels((prev) => ({
              ...prev!,
              MyDms: prev ? [...prev.ChannelsToJoin, newChannel] : [newChannel],
            }));
            break;
        }
        /* update openedWindows state */
        setOpenedWindows((prev) => [...(prev ?? []), newChat]);
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

  const findIdInList = <T extends { id: number }>(list?: T[], idToFind?: number): T | undefined => {
    const foundElem = list?.find(window => window.id === idToFind);
    return foundElem;
  };

  /* in handleOpenWindow we handle 2 cases :
   * case open an already existing conversation
      we need to get the history of the conversation
      send the event to the back with a full id
   * case open a new conversation :
      send the event to the back with a empty id
   */
  const handleOpenWindow = async (pseudo?: string, chatId?: number, password?: string) => {
    if (chatId && !findIdInList(openedWindows, chatId)) { //case already existing conversation
      const newWindow: IChatWindow = (await (backRequest('channels/' + chatId + '/chatWindow', 'GET'))).data
      setOpenedWindows(current => {return([...current || [], newWindow])})
      console.log("newWindow : ", newWindow);
    }
    socket?.emit('JoinChannel', {pseudo: pseudo, chatId: chatId, Password: password});
  }

  // const handleCloseWindow = (id : string) => {
  //   const closingWingow: IChatWindow = {
  //     id: '',
  //     members: [],
  //     history: [],
  //   }
  //   setOpenedWindows((prev) => prev ? prev.filter((f) => f !== closingWingow) : []);
  // }

  /*********** return ctx ************/
  return (
    <ChatContext.Provider value={{ socket, friends, connectedFriends, disconnectedFriends, channels, openedWindows }}>
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
