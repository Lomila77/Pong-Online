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
    in_game?: boolean;
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
  owner: IChatMember,
  admins: IChatMember[],
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
  const [prevPseudo, setPrevPseudo] = useState<string>('');

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
    setPrevPseudo(user?.pseudo || '');
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

      /* *********************************************************
          * Message Created:
      ***********************************************************/
      newSocket?.on('Message Created', (message: IChatHistory, channelId: number) => {
        console.log("Message Created recieved", message);
        setOpenedWindows((prevWindow: IChatWindow[]) => {
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
          setChannels((prev: IChannels) => ({
            ...prev!,
            MyChannels: addChannel(prev.MyChannels, newChannel),
            ChannelsToJoin: removeChannel(prev.ChannelsToJoin, newChannel.id),
          }))
          handleOpenWindow(newChannel);
        }
      });

      /* *********************************************************
          * Quited :
            - if quited, remove channel from myChannels and then add it to channelToJoin (if !isPrivate)
      ***********************************************************/
      newSocket?.on('quited', (channel: IChannel) => {
        channel.type = "ChannelsToJoin";
        setChannels((prev: IChannels) => ({
          ...prev!,
          ChannelsToJoin: (channel.isPrivate ? prev.ChannelsToJoin : addChannel(prev.ChannelsToJoin, channel)),
          MyChannels: removeChannel(prev.MyChannels, channel.id),
        }));
        console.log("Channel quited: \n\n\n", channel.id);
        console.log("\n\n", channels);
      });

      /* *********************************************************
          * user leave :
            - update member
      ***********************************************************/
      newSocket?.on('user leave', (channel: IChannel) => {
        setChannels((prev: IChannels) => ({
          ...prev!,
          MyChannels: updateChannel(prev.MyChannels, channel),
        }));
        console.log("user leave receveid: ", channel);
      });

      newSocket?.on('chan deleted', (chatId: number) => {
        setChannels((prev: IChannels) => ({
          ...prev!,
          ChannelsToJoin: removeChannel(prev.ChannelsToJoin, chatId),
          MyChannels: removeChannel(prev.MyChannels, chatId),
        }));
        console.log("Channel deleted: \n\n\n", chatId);
      });

      /* *********************************************************
          * Invited:
            - invite a friend in channel
      ***********************************************************/
      newSocket?.on('invited', (channel: IChannel) => {
        console.log("invited signal received", channel.id);
        setChannels((prev: IChannels) => ({
          ...prev!,
          ChannelsToJoin: removeChannel(prev.ChannelsToJoin, channel.id),
          MyChannels: addChannel(prev.MyChannels, channel),
        }));
      });

      /* *********************************************************
          * Chan updated:

            -
      ***********************************************************/
      newSocket?.on('chan updated', (channelid: number, isPassword: boolean, Password: string) => {
          setChannels((prev: IChannels) => ({
              ...prev!,
              MyChannels: prev.MyChannels.map((channel: IChannel, index: number) => {
                  if (index === channelid) {
                      return {
                          ...channel,
                          isPassword: isPassword,
                          Password: (isPassword ? Password : ''),
                      };
                  }
                  return channel;
              }),
          }));
      });


      /* *********************************************************
          * Friend connected:
            - update member with updatedUser
      ***********************************************************/
      newSocket?.on('Friend connected', (updatedUser: IChatMember) => {
        console.log("Friend connected recieved", updatedUser)
        updateChatMember(updatedUser);
      });

      /* *********************************************************
          * Friend disconnected:
            - update member with updatedUser
      ***********************************************************/
      newSocket?.on('Friend disconnected', (updatedUser: IChatMember) => {
        console.log("Friend disconnected recieved", updatedUser)
        updateChatMember(updatedUser);
      });

      /* *********************************************************
          * Friend disconnected:
            - update member with updatedUser
      ***********************************************************/
      newSocket?.on('Friend disconnected', (updatedUser: IChatMember) => {
        console.log("Friend disconnected recieved", updatedUser)
        updateChatMember(updatedUser);
      });

      /* *********************************************************
          * UserGameState:
            - update member with updatedUser
      ***********************************************************/
      newSocket?.on('userGameState', (userId: number) => {
        // emit chat gateway iam in game and tell to my friend i am in game
        newSocket?.emit('ingame Update');
        console.log("user gamestate received");
      });

      newSocket?.on('ingame Update', (updatedUser: IChatMember) => {
        console.log("ingame Update", updatedUser)
        updateChatMember(updatedUser);
      });

      /* *********************************************************
          * pseudo Update:
            - update member with updatedUser
      ***********************************************************/
      newSocket?.on('pseudo Update', (updatedUser: IChatMember) => {
        console.log("pseudo update recieved", updatedUser)
        updateChatMember(updatedUser);
      });

      /* *********************************************************
          * new owner:
            - update channel with new owner
      ***********************************************************/
      newSocket?.on('new owner', (channel: IChannel) => {
        console.log("new owner event received", channel)
        setChannels((prev: IChannels) => ({
          ...prev!,
          MyChannels: updateChannel(prev.MyChannels, channel),
        }));
      });

      /* *********************************************************
          * NewUserJoin:
            - update channel with new member
      ************************************************************/
      newSocket?.on('NewUserJoin', (channel: IChannel) => {
        console.log("new user join event received", channel)
        setChannels((prev: IChannels) => ({
          ...prev!,
          MyChannels: updateChannel(prev.MyChannels, channel),
        }));
      });

      /* *********************************************************
          * quit:
            - A member has left channel
      ***********************************************************/
      newSocket?.on('quit', (channel: IChannel) => {
        console.log("quit signal received", channel)
        setChannels((prev: IChannels) => ({
          ...prev!,
          MyChannels: updateChannel(prev.MyChannels, channel),
        }));
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

  /* *********************************************************
      * pseudo Update:
        - invite a friend in channel
  ***********************************************************/

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

  /* *********************************************************
      * useEffect{}[user, prevPseudo]
          - on change of user state change pseudo
          - the horrible ifs conditions is due to the fact that for some reason
            on update of user via settings user goes from partially "undefined" user
            to fully "defined pseudo" state which triggers the useEffect
            otherwise it would have been simpler to listen to user.pseudo only
  ***********************************************************/
  useEffect (() => {
    if (!socket || prevPseudo == '' || !user || !user?.fortytwo_id || !user.pseudo)
      return;
    if ( user.fortytwo_id && user.pseudo && prevPseudo != user.pseudo) {
      console.log('sending psudo Update signal', user.fortytwo_id)
      socket?.emit("pseudo Update")
      setPrevPseudo(user.pseudo);
    }
    }, [user, prevPseudo])


  /*********** chat window states ************/

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

  //todo : check if I can use a prev earlier
  const addChannelToChannelsByType = (channels: IChannels, newChannel: IChannel) => {

    if (newChannel.type == "MyChannels" && !newChannel.members.find(member => member.id === user?.fortytwo_id))
      newChannel.type = "ChannelsToJoin";
    if(!isChannelKnown(newChannel.type, newChannel.id)) {
      setChannels((prev: IChannels) => ({
        ...prev!,
        [newChannel.type]: prev ? [...prev[newChannel.type], newChannel] : [newChannel],
      }))
    }
  }

    /* *********************************************************
      * updateMemberById
        - usage : called after recieving event 'Friend connected/disconnected && pseudo Update'
        --> update user in Ichannels && openedWindow
    ***********************************************************/
  const updateChatMember = (updatedUser: IChatMember) => {
    setChannels((prev) => {
      return getUpdatedMembersIChannels(prev, updatedUser);
    });
    setOpenedWindows((prevWindow) => {
      return getUpdatedMembersIChatWindows(prevWindow, updatedUser)
    });
  }

  const getUpdatedMembersIChannels = (channels: IChannels, updatedUser: IChatMember) => {
    const updatedMyDms = channels.MyDms.map((channel) => getUpdatedMembersIChannel(channel, updatedUser))
    const updatedMyChannel = channels.MyChannels.map((channel) => getUpdatedMembersIChannel(channel, updatedUser))
    const updatedMyDmsList = channels.ChannelsToJoin.map((channel) => getUpdatedMembersIChannel(channel, updatedUser))
    return {
      MyDms: updatedMyDms,
      MyChannels: updatedMyChannel,
      ChannelsToJoin: updatedMyDmsList,
    }
  }

  const getUpdatedMembersIChannel: (channel: IChannel, updatedUser: IChatMember) => IChannel = (channel, updatedUser) => {
    if (!channel)
      return channel;

    const updatedMembers = channel.members.map((member) =>
      member.id === updatedUser.id ? { ...member, ...updatedUser } : member
    );
    const updatedAdmins = channel.admins ? channel.admins.map((admin) =>
      admin.id === updatedUser.id ? { ...admin, ...updatedUser } : admin
    )
    : [] ;

    const updatedOwner = channel.owner ?
      channel.owner.id === updatedUser.id ? { ...channel.owner, ...updatedUser } : channel.owner
      : channel.owner;

    return {
      ...channel,
      members: updatedMembers,
      admins: updatedAdmins,
      owner: updatedOwner,
    };
  };


  const getUpdatedMembersIChatWindows = (windows: IChatWindow[], updatedUser: IChatMember) => {
    // const updatedMyDms = channels.MyDms.map((channel) => getUpdatedMembersIChannel(channel, updatedUser))
    return windows.map((window) => getUpdatedMembersIChatWindow(window, updatedUser));
  }

  const getUpdatedMembersIChatWindow: (window: IChatWindow, updatedUser: IChatMember) => IChatWindow = (window, updatedUser) => {
    if (!window)
      return window;

    const updatedMembers = window.members.map((member) =>
      member.id === updatedUser.id ? { ...member, ...updatedUser } : member
    );
    const updatedAdmins = window.admins ? window.admins.map((admin) =>
      admin.id === updatedUser.id ? { ...admin, ...updatedUser } : admin
    )
    : [] ;

    const updatedOwner = window.owner ?
      window.owner.id === updatedUser.id ? { ...window.owner, ...updatedUser } : window.owner
      : window.owner;

    return {
      ...window,
      members: updatedMembers,
      admins: updatedAdmins,
      owner: updatedOwner,
    };
  };

  //todo : change function by const =>
  function removeChannel(channelList: IChannel[], channelId: number): IChannel[] {
    // console.log("removeChannel : initial channel list ", channelList);
    // const filteredlist = channelList.filter((channel) => channel.id == channelId);
    // console.log("removeChannel : filtered channel list ", filteredlist);
    return channelList.filter((channel) => channel.id != channelId);
  }

  function updateChannel(channelList: IChannel[], channelToAdd: IChannel): IChannel[] {
    const updatedChannel = removeChannel(channelList, channelToAdd.id);
    return addChannel(updatedChannel, channelToAdd);
    // return channelList.filter((channel) => channel.id == channelId);
  }

  function addChannel(channelList: IChannel[], newChannel: IChannel): IChannel[] {
    // console.log("addChannel : initial channel list ", channelList);

    const channelExists = channelList.find((channel) => channel.id === newChannel.id);
    if (!channelExists) {
      return [...channelList, newChannel];
    }
    return channelList;
  }

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
                setOpenedWindows((current: IChatWindow[]) => {return([...current || [], newWindow])})
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
    setOpenedWindows((prev: IChatWindow[]) => prev ? prev.filter((f) => f.id !== id) : []);
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
    if ((data.type && !isChannelKnown(data.type, data.id))
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
    const channel = channels.MyChannels.find((channel: IChannel) => channel.id == chatId);
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
    if (isPassword && channel?.isPassword) // TODO add change pwd
      socket?.emit('update', {channelId: chatId, userId: targetId, isPassword: isPassword, Password: password});
    else if (!isPassword && channel?.isPassword) {
      socket?.emit('update', {channelId: chatId, userId: targetId, isPassword: isPassword});
    }
  }

  const addFriendToChannel = (nameToAdd: string, chatId: number) => {
    //check if name is in channels.MyDms (is friend)
    const foundChannel = channels.MyDms.find((channel: IChannel) =>
      channel.members.some((member) => member.name === nameToAdd)
    );
    //get friend profile via pseudo
    const friend = foundChannel ? foundChannel.members.find((member: IChatMember) => member.name === nameToAdd) : undefined;
    console.log(friend);
    if (friend) {
      console.log('emit : invit chatid: ', chatId, "/", friend.id);
      socket?.emit('invit', {chatId: chatId, userId: friend.id});
    }
  }


  const leaveChannel = (chatId: number) => {
    socket?.emit('quit', {chatId: chatId});
    console.log("EMIT QUIT channel: ", chatId ,"\n\n\n");
    closeWindow(chatId);
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
