import React, { useEffect } from 'react';
import { useState } from 'react';
import { useUser } from "../context/UserContext";
import {IChatWindow, IChannel, IChannels, IFormData, useChat} from "../context/ChatContext";
import CreateChannel from "./CreateChannel";
import WindowChannel from "./WindowChannel";
import WindowChat from "./WindowChat";
import CreateGame from "../pages/game/CreateGame"
import Messagerie from "../images/chat.svg";
import Play from "../images/play.svg";
import Channel from "../images/channel.svg";
import NewChannel from "../images/newChan.svg";
import Cross from "../images/cross.svg";
import Check from "../images/check.svg";
import {backRequest} from "../api/queries";
import DisplayDm from "./DisplayDm";
import DisplayChannels from "./DisplayChannels";
import DisplayChannelsToJoin from "./DisplayChannelsToJoin";

const Chat: React.FC = () => {
    const {openedWindows, closeWindow} = useChat();
    const {user, setUser} = useUser();                                                                      // Recuperation de la session de l'utilisateur
    const [loadPrivateGame, setLoadPrivateGame] = useState(-1);
    const [selectedTargetToDestroy, setSelectedTargetToDestroy] = useState<IChannel | null>(null);             // Permet de detruire la fenetre selectionner


    const [createChannel, setCreateChannel] = useState(false);                                          // Appel module create channe
    const toggleCreateChannel = () => {                                                                             // Permet de gerer la creation d'un channel quand j'appuis sur le bouton create channel
        setCreateChannel(createChannel !== true);
    }

    /* Permet de configurer l'affichage, le contenue et le style du drawer */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawerOpen = () => {
        setDrawerOpen(drawerOpen !== true);
    }

    const [displayChannelDrawer, setDisplayChannelDrawer] = useState(false);
    /* Gere le basculement DM/Channel */
    const toggleDisplayChannel = () => {
        setDisplayChannelDrawer(displayChannelDrawer !== true);
    }

    useEffect(() => {
        if (selectedTargetToDestroy)
            closeWindow(selectedTargetToDestroy.id);
        setSelectedTargetToDestroy(null);
    }, [selectedTargetToDestroy]);

    return (
        <div className={"drawer drawer-end flex flex-col-reverse h-full items-end static"}>
            {loadPrivateGame != -1 && (
                <div className={"absolute z-10 left-1/3  bg-orangeNG"}>
                    <CreateGame channelId={loadPrivateGame}/>
                </div>
            )}
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" onClick={toggleDrawerOpen}/>
            <div className="drawer-content">
                <label htmlFor="my-drawer-4"
                       className="btn drawer-button btn-circle m-5 p-2">
                    <img src={Messagerie} alt={"chat"} className={"w-10"}/>
                </label>
            </div>
            <div className="drawer-side mt-16">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay opacity-0"></label>
                <ul className={"menu p-4 w-60 min-h-full text-base-content relative "  + colorDrawer.drawer}>
                    {drawerContent && drawerContent.map((target: IChannel , index: number) => (
                        <li key={index} className="flex flex-row justify-between items-center">
                            <button className={"p-4 overflow-auto btn btn-ghost font-display " +  colorDrawer.text}
                                    onClick={() => setSelectedTarget(target)}>{target.type == 'MyDms' ? target.members[1].name : target.name}
                                {target.type == 'MyDms' && (
                                    <div className={"badge badge-xs " + (target.type == 'MyDms' && target.members[1].connected ? " badge-success " : " badge-neutral ") }></div>
                                )}
                            </button>
                            {displayInputPassword && selectedTarget && selectedTarget.id == target.id && (
                                <div className={"absolute text-black bg-orangeNG flex flex-row justify-between items-center px-2 my-1"}>
                                    <input type="password"
                                           placeholder="Password"
                                           className={"input input-sm w-full max-w-xs " + (displayBadPassword? "border-rose-500" : "")}
                                           value={password}
                                           onChange={e => {
                                               setPassword(e.target.value);
                                           }}
                                    />
                                    <button onClick={handlePassword} className={"btn btn-sm w-10"}>
                                        <img src={Check} alt={"Check"}/>
                                    </button>
                                </div>
                            )}

                            {displayChannelDrawer && target.type != "ChannelsToJoin" && (
                                <button className="btn btn-square btn-ghost btn-sm p-2" onClick={() => setLeaveChanID(target.id)}>
                                    <img src={Cross} alt={"LeaveChat"} className={""}/>
                                </button>
                            )}

                            {!displayChannelDrawer && (
                                <button className="btn btn-square btn-ghost btn-sm"
                                        onClick={() => setLoadPrivateGame(target.id)}>
                                    <img src={Play} alt={"play"} className={""}/>
                                </button>
                            )}
                        </li>
                    ))}
                    {displayChannelDrawer && (
                        <div className="self-center mt-auto mb-48 border border-2 rounded-lg ">
                            <button className="btn btn-square btn-ghost p-2" onClick={toggleCreateChannel}>
                                <img src={NewChannel} alt={"newChan"} className={"w-10"}/>
                            </button>
                        </div>
                    )}
                    <div
                        className="self-center flex flex-row items-center justify-around mb-36 absolute bottom-0 border border-2 rounded-lg p-2">
                        <img src={Messagerie} alt={"chat"} className="mx-5 w-10"/>
                        <input type="checkbox"
                               className="toggle toggle-md"
                               defaultChecked={false}
                               onChange={toggleDisplayChannel}/>
                        <img src={Channel} alt={"channel"} className="mx-5 w-10"/>
                    </div>
                    <div className="absolute mr-64 mb-32 bottom-0 flex flex-row-reverse overflow-hidden">
                        {drawerOpen && openedWindows && openedWindows.map((channel: IChatWindow, index: number) =>
                                channel.type == 'MyDms' && (
                                    <div key={index} className="px-5">
                                        <WindowChat user={channel.members[1].name}
                                                    me={user}
                                                    destroyChat={() => setSelectedTargetToDestroy(channel)}
                                                    history={channel.history}
                                                    chatId={channel.id}
                                        />
                                    </div>
                                )
                        )}
                        {drawerOpen && openedWindows && openedWindows.map((channel: IChatWindow, index: number) =>
                            channel.type == 'MyChannels' && (
                                <div key={index} className="px-5">
                                    <WindowChannel chat={channel}
                                                   destroyChannel={() => setSelectedTargetToDestroy(channel)}
                                    />
                                </div>
                            ))}
                    </div>
                    {createChannel && (
                        <CreateChannel close={toggleCreateChannel}/>
                    )}
            </div>
        </div>
);
}

export default Chat;
