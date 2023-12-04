import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IChannel, IChannels, backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';

// Todo: friends has no socket event and therefore do not selfactualise


/** duplicated code from queries */
// export interface IChannel {
//   id: number,
//   name: string,
//   type: string,
//   members: number[],
// }

// export interface IChannels{
// 	MyDms: IChannel[];
// 	MyChannels: IChannel[];
// 	ChannelsToJoin : IChannel[];
//   }
// /** duplicated code  */


export interface IChatFriend {
  id: number
  name: string
  type: string
  members: number[],
  connected: boolean
}

export interface IChatHistory {
  owner: {
    pseudo: string
  };
  content: string;
}

//for windows that are openned
export interface IChatMember {
  id: number;
  name: string;
}
export interface IChatWindow {
  id: number;
  name: string;
  type: string;

  members: IChatMember[];
  history: IChatHistory[];
}

export interface IFormData {
  name: string,
  isPrivate: boolean,
  isPassword: boolean,
  password: string,
  members: number[],
  type: string,
}

const ChatContext = createContext<{
  socket: Socket | null
  friends: IChatFriend[]
  // connectedFriends: string[]
  // disconnectedFriends: string[]
  channels: IChannels | null
  openedWindows: IChatWindow[] | null
} | null>(null);

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<IChatFriend[]>([])
  // const [connectedFriends, setConnectedFriends] = useState<string[]>([])
  // const [disconnectedFriends, setDisconnectedFriends] = useState<string[]>([])
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
        data.chatFriends && setFriends(data.chatFriends);
      })
      backRequest('chat/channels', 'GET').then((data) => {
        console.log(data);
        data.channels && setChannels(data.channels);
      })
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
      // Channel Created event : a new channel is created => concequence need to update our list of existing channels
      // newSocket?.on('Channel Created', (newChat : IChannel) => {
      //   const newChannel : IChannel = {name: newChat.name, id: newChat.id, type: newChat.type, members newChat.members}
      //   switch (newChat.type){
      //     case 'dm' :
      //       setChannels((prev) => ({
      //         ...prev!,
      //         MyDms: prev ? [...prev.MyDms, newChannel] : [newChannel],
      //       }));
      //       setOpenedWindows((prev) => [...(prev ?? []), newChat]);
      //       break;
      //     case 'channel' : // 2 cases: Im a member of channel / Im not a member
      //       if (newChat.members.some(member=> member.name === user?.pseudo)) {
      //         newChannel.type = "MyChannels"
      //         setChannels((prev) => ({
      //           ...prev!,
      //           MyChannels: prev ? [...prev.MyChannels, newChannel] : [newChannel],
      //         }));
      //         setOpenedWindows((prev) => [...(prev ?? []), newChat]);
      //       }
      //       else {
      //         newChannel.type = "ChannelsToJoin"
      //         setChannels((prev) => ({
      //           ...prev!,
      //           ChannelsToJoin: prev ? [...prev.ChannelsToJoin, newChannel] : [newChannel],
      //         }));
      //       }
      //       break;
      //   }
      // });

      newSocket?.on('Channel Created', (newChat : IChannel) => {

        //todo: update Ichannels ->
          // todo : case type Mydms : put chat in Mydms if not inside already
          // todo : case Mychannels : if Im a member, put in MyChannels
        switch (newChat.type) {
          case "MyDms" :
            if(!findIdInList(channels?.MyDms, newChat.id)) {
              setChannels((prev) => ({
                ...prev!,
                MyDms: prev ? [...prev.MyDms, newChat] : [newChat],
              }));
            }
            else {
              setChannels((prev) => ({
              ...prev!,
              MyDms: prev?.MyDms?.map((channel) => (channel.id === newChat.id ? newChat : channel)) || [],
              }));
              // todo replace element with sameid with newChat
            }
            break;
          case "MyChannels" :
            break;
        }

        // const newChannel : IChannel = {name: newChat.name, id: newChat.id, type: newChat.type, members newChat.members}
        // switch (newChat.type){
        //   case 'dm' :
        //     setChannels((prev) => ({
        //       ...prev!,
        //       MyDms: prev ? [...prev.MyDms, newChannel] : [newChannel],
        //     }));
        //     setOpenedWindows((prev) => [...(prev ?? []), newChat]);
        //     break;
        //   case 'channel' : // 2 cases: Im a member of channel / Im not a member
        //     if (newChat.members.some(member=> member === user?.fortytwo_id)) {
        //       newChannel.type = "MyChannels"
        //       setChannels((prev) => ({
        //         ...prev!,
        //         MyChannels: prev ? [...prev.MyChannels, newChannel] : [newChannel],
        //       }));
        //       setOpenedWindows((prev) => [...(prev ?? []), newChat]);
        //     }
        //     else {
        //       newChannel.type = "ChannelsToJoin"
        //       setChannels((prev) => ({
        //         ...prev!,
        //         ChannelsToJoin: prev ? [...prev.ChannelsToJoin, newChannel] : [newChannel],
        //       }));
        //     }
        //     break;
        // }
      });
      newSocket?.on('Channel Joined', (newChat: IChannel) => {
        //todo : openned window;
          //todo : back request to get history;
          //todo setOpenedWindo;
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
    const foundElem = list?.find(elem => elem.id === idToFind);
    return foundElem;
  };

  /* in handleOpenWindow we handle 2 cases :
   * case open an already existing conversation
      we need to get the history of the conversation
      send the event to the back with a full id
   * case open a new conversation :
      send the event to the back with a empty id
   */
  const handleOpenWindow = async (chatData : IChannel | IChatFriend, form?: IFormData) => {

    const data = {
      id: chatData.id,
      name: form?.name? form.name : chatData.name,
      type: form?.type? form.type : chatData.type,
      members: form?.members? form.members : chatData.members,
      isPrivate: form?.isPrivate? form.isPrivate : false,
      isPassword: form?.isPassword? form.isPassword : false,
      password: form?.password? form.password : "",
    }
    socket?.emit('JoinChannel', data)

    //todo 'channel created' => update Ichannels
    //todo 'channel joined' => setopenned window with history.
  }

  // const handleOpenWindow = async (pseudo?: string, chatId?: number, password?: string) => {
  //   if (chatId && !findIdInList(openedWindows, chatId)) { //case already existing conversation
  //     const newWindow: IChatWindow = (await (backRequest('channels/' + chatId + '/chatWindow', 'GET'))).data
  //     setOpenedWindows(current => {return([...current || [], newWindow])})
  //     console.log("newWindow : ", newWindow);
  //   }
  //   socket?.emit('Join Channel', {pseudo: pseudo, chatId: chatId, Password: password});
  // }

  // const handleOpenWindow = async (pseudo?: string, chatId?: number, password?: string) => {
  //   if (chatId && !findIdInList(openedWindows, chatId)) { //case already existing conversation
  //     const newWindow: IChatWindow = (await (backRequest('channels/' + chatId + '/chatWindow', 'GET'))).data
  //     setOpenedWindows(current => {return([...current || [], newWindow])})
  //     console.log("newWindow : ", newWindow);
  //   }
  //   socket?.emit('Join Channel', {pseudo: pseudo, chatId: chatId, Password: password});
  // }

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
    <ChatContext.Provider value={{ socket, friends, /*connectedFriends, disconnectedFriends,*/ channels, openedWindows }}>
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
