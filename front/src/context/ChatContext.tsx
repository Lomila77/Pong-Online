import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IChannels, backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';

export interface friends {
  connected: string[]
  disconnected: string[]
}

export interface IChatMsg {
  owner: {
    pseudo: string
  };
  content: string;
}

export interface IChatWindow {
  id: number;
  name: string;
  members: string[];
  history: IChatMsg[];
}

const ChatContext = createContext<{
  socket: Socket | null
  friends: string[]
  connectedFriends: string[]
  disconnectedFriends: string[]
  channels: IChannels | null
  openedWindows: IChatWindow[] | null
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<string[]>([])
  const [connectedFriends, setConnectedFriends] = useState<string[]>([])
  const [disconnectedFriends, setDisconnectedFriends] = useState<string[]>([])
  const [channels, setChannels ] = useState<IChannels | null>(null);
  const [openedWindows, setOpenedWindows] = useState<IChatWindow[]>()

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

      newSocket?.on('Channel Created', (id:number, name: string, members: string[], type: string) => {
        switch (type){
          case 'dm' :
            
          case 'private' :
          case 'public' :
        }
        // set channel liste
        // set opnedWindows
        //setChannels((prev) => [...prev, channel]);
      });
      // newSocket?.on('channelUpdate', (channel) => {
      //   setChannels((prev) => [...prev, channel]);
      // });
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

  const findIdInList = <T extends { id: number }>(list: T[], idToFind: number): T | undefined => {
    const foundElem = list.find(window => window.id === idToFind);
    return foundElem;
  };


    const handleOpenWindow = async (pseudo?: string, chatId?: number, password?: string) => {
    if (openedWindows && chatId && findIdInList(openedWindows, chatId))
      return
    if (chatId) { //case it has an history
      const newWindow: IChatWindow = (await (backRequest('channels/' + chatId + '/chatWindow', 'GET'))).data
      setOpenedWindows(current => {return([...current || [], newWindow])})
      console.log("newWindow : ", newWindow);
    }
    // TODO: in case there is no history, I will have to listen to socket to check newly created chan.
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
    <ChatContext.Provider value={{ socket, friends, connectedFriends, disconnectedFriends, channels }}>
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
