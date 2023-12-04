import React, { useEffect } from 'react';
import { useState } from 'react';
import { useUser } from "../context/UserContext";
import {IChatWindow, IChannel, IChannels, IFormData, useChat} from "../context/ChatContext";
import { Socket } from "socket.io-client";
import CreateChannel from "./CreateChannel";
import WindowChannel from "./WindowChannel";
import WindowChat from "./WindowChat";
import Messagerie from "../images/chat.svg";
import Play from "../images/play.svg"
import Channel from "../images/channel.svg"
import NewChannel from "../images/newChan.svg"

function Chat() {
    const {socket, friends, channels, openedWindows, openWindow } = useChat() as {
        socket: Socket | null;
        friends: IChannel[];
        channels: IChannels;
        openedWindows: IChatWindow[];
        openWindow: (chatData? : IChannel, form?: IFormData, password?: string) => void
    };

    // Recuperation de la session de l'utilisateur
    const {user, setUser} = useUser();
    // Permet de selectionner le user pour afficher le dm avec celui-ci
    const [selectedTarget, setSelectedTarget] = useState<IChatWindow>(null);

    // Liste des dms ouvert (en bas de page)
    //const [openDm, setOpenDm] = useState([]);
    // Liste des channels ouvert (en bas de page)
    const [openChannel, setOpenChannel] = useState([]);

    // Fenetre a detruire
    const [destroyWindowChat, setDestroyWindowChat] = useState(-1);
    const [destroyWindowChannel, setDestroyWindowChannel] = useState(-1);

    // LUC ==========================================================================
    const [createChannel, setCreateChannel] = useState(false);
    // Permet de gerer la creation d'un channel quand j'appuis sur le bouton create channel
    const toggleCreateChannel = () => {
        setCreateChannel(createChannel !== true);
    }

    // Permet de configurer l'affichage, le contenue et le style du drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawerOpen = () => {
        setDrawerOpen(drawerOpen !== true);
    }
    const [displayChannelDrawer, setDisplayChannelDrawer] = useState(false);
    const [colorDrawer, setColorDrawer] = useState({drawer: "bg-base-200", text: "text-orangeNG"});
    const [drawerContent, setDrawerContent] = useState<IChannel[]>(friends);
    //useEffect(() => { TODO delete coms after test
    //    setDrawerContent(friends);
    //}, []);

    // Gere le basculement DM/Channel
    const toggleDisplayChannel = () => {
        setDisplayChannelDrawer(displayChannelDrawer !== true);
    }
    useEffect(() => {
        setColorDrawer(displayChannelDrawer ?
            {drawer: "bg-[#E07A5F]", text: "text-white"} :
            {drawer: "bg-base-200", text: "text-orangeNG"});
        setDrawerContent(displayChannelDrawer ? channels.MyChannels + channels.ChannelsToJoin : friends); //TODO trouver un moyen de separer MyChannels et ChannelsToJoin
    }, [displayChannelDrawer, friends]);

    // Ajoute au dm ouvert le dm concerner par selectedUser afin de gerer son affichage en bas de page
    useEffect(() => {
        if (!selectedTarget)
            return;
        if ((selectedTarget.name && !openedWindows.find(content => content.name === selectedTarget.name)) ||
            (selectedTarget.id && !openedWindows.find(content => content.id === selectedTarget.id)))
            openWindow(selectedTarget);
            // handleOpenWindow(selectedTarget);
        setSelectedTarget(null);
    }, [selectedTarget]);

    // Efface un dm pour ne plus l'afficher, apres qu'il ete fermee via la croix
    // TODO call luc pour effacer un channel
    useEffect(() => {
        console.log("destroyWindowChat modified");
        if (destroyWindowChat != -1) {
            //setOpenDm((prevDm) =>
            //    prevDm.filter((dm, index) => index !== destroyWindowChat));
            setDestroyWindowChat(-1);
        }
        if (destroyWindowChannel != -1) {
            //setOpenChannel((prevChannel) =>
            //    prevChannel.filter((channel, index) => index !== destroyWindowChannel));
            setDestroyWindowChannel(-1);
        }
        }, [destroyWindowChat, destroyWindowChannel]);

    return (
        <div className={"drawer drawer-end flex flex-col-reverse h-full items-end static"}>
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
                        <li key={index} className="flex flex-row justify-between">
                            <button className={`btn btn-ghost font-display ${target.connected ? "disabled" : ""} ` + colorDrawer.text}
                                    onClick={() => setSelectedTarget(target)}>{target.name}
                            </button>
                            {!displayChannelDrawer && (
                                <button className="btn btn-square btn-ghost">
                                    <img src={Play} alt={"play"} className={"w-10"}/>
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
                    <div className="self-center flex flex-row items-center justify-around mb-36 absolute bottom-0 border border-2 rounded-lg p-2">
                        <img src={Messagerie} alt={"chat"} className="mx-5 w-10"/>
                        <input type="checkbox"
                               className="toggle toggle-md"
                               defaultChecked={false}
                               onChange={toggleDisplayChannel}/>
                        <img src={Channel} alt={"channel"} className="mx-5 w-10"/>
                    </div>
                </ul>
                <div className="absolute mr-64 mb-32 bottom-0 flex flex-row-reverse overflow-hidden">
                    {drawerOpen && openedWindows.map((channel, index) =>
                        channel.type == 'MyDms' && (
                            <div key={index} className="px-5">
                                <WindowChat user={channel.name} // TODO: fix name par le dest
                                            me={user}
                                            destroyChat={() => setDestroyWindowChat(index)}
                                            socket={socket}
                                            history={channel.history}
                                />
                            </div>
                        )
                    )}
                    {drawerOpen && openedWindows.map((channel, index) =>
                        channel.type == 'MyChannels' && (
                        <div key={index} className="px-5">
                            <WindowChannel chatName={channel.name}
                                        me={user}
                                        destroyChannel={() => setDestroyWindowChannel(index)}
                                        socket={socket}/>
                        </div>
                    ))}
                </div>
                {createChannel && (
                    <CreateChannel socket={socket} close={toggleCreateChannel}/>
                )}
            </div>
        </div>
    );
}

export default Chat;
