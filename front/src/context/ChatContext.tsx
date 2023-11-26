import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';


export interface friends {
  connected: string[]
  disconnected: string[]
}

const ChatContext = createContext<{
  socket: Socket | null
  friends: string[]
  connectedFriends: string[]
  disconnectedFriends: string[]
  channels: string[]
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<string[]>([])
  const [connectedFriends, setConnectedFriends] = useState<string[]>([])
  const [disconnectedFriends, setDisconnectedFriends] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([]);

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
        data.channels && setChannels(data.channels.MyChannels);
      })
      newSocket?.on('friendConnected', (friend) => {
        setConnectedFriends((prev) => [...prev, friend]);
        setDisconnectedFriends((prev) => prev.filter((f) => f !== friend));
      });
      newSocket?.on('friendDisconnected', (friend) => {
        setDisconnectedFriends((prev) => [...prev, friend]);
        setConnectedFriends((prev) => prev.filter((f) => f !== friend));
      });
      newSocket?.on('channelUpdate', (channel) => {
        setChannels((prev) => [...prev, channel]);
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
      console.log("useState Socket : ", socket);
      initChatCtx();
    }
    else if (!user?.isAuthenticated  && socket?.connected) {
      console.log("deleting socket useState Socket : ",user, socket);
      socketRef.current?.disconnect();
      setSocket(null)
    }
  }, [user])

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
