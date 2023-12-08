import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { backRequest, backResInterface } from '../api/queries';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { io, Socket } from 'socket.io-client';


// Todo : emit messages : might be type (message: string, channel : Ichannels);


// Todo : update channels (change password, name new admin ....)

// Todo : see if better to not open window when new channel is created but to have an other color on screen ?

// Todo : update channel --> update a channel inside Ichannels. idee de prototype : ('updateChannel', 'channel:Ichannel')
// Todo : need to handle error event with case : NotInvited, Banned, Wrong password, This channel does not exist!!!
// todo : need to handle newFriend in channel event

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
    isAdmin: boolean;
    isOwner: boolean;
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
  isPrivate: boolean,
  isPassword: boolean,
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
  sendAdminForm: (  chatId: number, targetId: number,
                    mute: boolean, unMute: boolean,
                    ban: boolean, unBan: boolean,
                    kick: boolean, admin: boolean,
                    isPassword: boolean, password: string) => void
  addFriendToChannel: (nameToAdd: string, chatId: number) => void
  leaveChannel: (chatId: number) => void
} | null>(null);


export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channels, setChannels ] = useState<IChannels>({MyDms: [], MyChannels: [], ChannelsToJoin: []});
  const [openedWindows, setOpenedWindows] = useState<IChatWindow[]>([])

  /*********** init chat Context ************/
  const socketRef = useRef<Socket | null>(null);
  const initChatCtx = () => {
    const currentUser: IChatMember = {name : user?.pseudo || "",
                                      id: user?.fortytwo_id || 0,
                                      connected: user?.isAuthenticated,
                                      isAdmin: false,
                                      isOwner: false,
    };
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

      newSocket?.on('Message Created', (message: IChatHistory, channelId: number) => {
        console.log(message);
        setOpenedWindows(prevWindow => {
          return prevWindow.map((window) => {
            if (window.id === channelId) {
              return {
                ...window,
                history: [...window.history, message]
              }
            }
            return window
          });
        });
      });

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

            - if new channel joined, open channel window //todo not accurate anymore
      ***********************************************************/
      newSocket?.on('Channel Joined', (newChannel: IChannel) => {
        console.log("channel Joined signal received\n", newChannel);
        if (newChannel.type != "MyDms"){
          newChannel.type = "MyChannels"
          setChannels((prev) => ({
            ...prev!,
            MyChannels: addChannel(prev.MyChannels, newChannel),
            ChannelsToJoin: removeChannel(prev.ChannelsToJoin, newChannel.id),
          }))
          handleOpenWindow(newChannel);
        }
      });

      /* *********************************************************
          * Channel Quited :

            - if quited, remove channel from myChannels and then add it to channelToJoin (if !isPrivate)
      ***********************************************************/
      newSocket?.on('quited', (chatId: number) => {
        console.log("Channel quited: \n\n\n", chatId);
        console.log("\n\n", channels);

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
      * isChannelKnown // USELESS DUE TO ASYNCRO OF SETCHANNELS
        - usage : if (usChannelKnown("MyDms", 42))
          --> check if MyDms has a channel of id 42
  ***********************************************************/
  const isChannelKnown = (channelKey: string, idToFind?: number) => {
    if (!idToFind)
      return false;
    return channels[channelKey].find((channel: IChannel) => channel.id === idToFind);
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

    addChannelToChannelsByType(channels, newChannel)
  }

  const addChannelToChannelsByType = (channels: IChannels, newChannel: IChannel) => {

    if (newChannel.type == "MyChannels" && !newChannel.members.find(member => member.id === user?.fortytwo_id))
      newChannel.type = "ChannelsToJoin";
    if(!isChannelKnown(newChannel.type, newChannel.id)) {
      setChannels((prev) => ({
        ...prev!,
        [newChannel.type]: prev ? [...prev[newChannel.type], newChannel] : [newChannel],
      }))
    }
  }

  function removeChannel(channelList: IChannel[], channelId: number): IChannel[] {
    console.log("removeChannel : initial channel list ", channelList);
    const filteredlist = channelList.filter((channel) => channel.id !== channelId);
    console.log("removeChannel : filtered channel list ", filteredlist);
    return channelList.filter((channel) => channel.id !== channelId);
  }

  function addChannel(channelList: IChannel[], newChannel: IChannel): IChannel[] {
    console.log("addChannel : initial channel list ", channelList);

    const channelExists = channelList.find((channel) => channel.id === newChannel.id);
    if (!channelExists) {
      return [...channelList, newChannel];
    }
    return channelList;
  }

  // function removeChannelById(channels: IChannels, channelId: number): IChannels {
  //   const updatedChannels = {
  //     MyDms: removeChannel(channels.MyDms, channelId),
  //     MyChannels: removeChannel(channels.MyChannels, channelId),
  //     ChannelsToJoin: removeChannel(channels.ChannelsToJoin, channelId),
  //   };

  //   return updatedChannels;
  // }

  /* *********************************************************
      * handleOpenWindow
        - usage : handleOpenWindow(ChannelToOpen)
          --> turn Ichannel into IchatWindow (Ichannel + message history )
  ***********************************************************/
          const handleOpenWindow = async (chatData : IChannel) =>{
            if (!ischatOpenned(chatData.id)){
              await (backRequest('chat/chatWindowHistory/' + chatData.id, 'GET')).then(ret => {
                const newWindow: IChatWindow = {
                  ...chatData,
                  history: ret?.data || []
                }
                setOpenedWindows(current => {return([...current || [], newWindow])})
              }
              )
            }
          }

  /*************************************** print functions */
  useEffect (() => {console.log("new openned window set : ", openedWindows)}, [openedWindows])
  useEffect (() => {console.log("new newChannels set : ", channels)}, [channels])
  useEffect (() => {if (channels?.MyDms.length) console.log("new newChannels set in MyDms: ", channels?.MyDms)}, [channels?.MyDms])
/********************************************************** */



  /* *********************************************************
      * fonctions to export
  ***********************************************************/
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
    if (data.type && !isChannelKnown(data.type, data.id)
      || data.type === 'ChannelsToJoin') {
      console.log("Join Channel called from openWindow")
      // console.log("openWindoc called : data = ", data);
      // console.log("socket = ", socket);
      socket?.emit('Join Channel', data)
    }
    else if (chatData) {
      console.log("inside openWindow before calling handleOpenWindow: ", chatData);
      handleOpenWindow(chatData);
    }
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

  // const addFriendToChannel = (nameToAdd: string, chatId: number) => {
  //   let userId: number;
  //   backRequest('users/isFriend/' + nameToAdd, 'GET').then(data => {
  //     if (!data.isFriend)
  //       return;
  //     else
  //       backRequest('users/user', 'PUT', {pseudo: nameToAdd}).then(data => {
  //         userId = data.fortytwo_id;
  //       })
  //   })
  //   socket?.emit('invit', {chatId: chatId, userId: userId});
  // }
  const addFriendToChannel = (nameToAdd: string, chatId: number) => {
    //check if name is in channels.MyDms (is friend)
    const foundChannel = channels.MyDms.find((channel) =>
      channel.members.some((member) => member.name === nameToAdd)
    );
    //get friend profile via pseudo
    const friend = foundChannel ? foundChannel.members.find((member) => member.name === nameToAdd) : undefined;
    console.log(friend);
    if (friend) {
      console.log('emit : invit chatid: ', chatId, "/", friend.id);
      socket?.emit('invit', {chatId: chatId, userId: friend.id});
    }
  }

  const leaveChannel = (chatId: number) => {
    socket?.emit('quit', {chatId: chatId});
    const channelToQuit = channels.MyChannels.find(channel => channel.id == chatId);
    channelToQuit.isPrivate ?
        setChannels((prev) => ({
          ...prev!,
          MyChannels: removeChannel(prev.MyChannels, channelToQuit.id),
        })) :
        setChannels((prev) => ({
          ...prev!,
          MyChannels: removeChannel(prev.MyChannels, channelToQuit.id),
          ChannelsToJoin: addChannel(prev.ChannelsToJoin, channelToQuit),
        }));
    closeWindow(channelToQuit.id);
  }

  /*********** return ctx ************/
  return (
    <ChatContext.Provider value={{ socket, channels, openedWindows, openWindow, closeWindow, sendMessage, sendAdminForm, addFriendToChannel, leaveChannel }}>
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
