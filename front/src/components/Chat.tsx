import React, { useEffect } from 'react';
import { useState } from 'react';
import WindowChat from "./WindowChat";
import Messagerie from "../images/chat.svg";
import Play from "../images/play.svg"
import Channel from "../images/channel.svg"
import {useUser} from "../context/UserContext";
import {io} from "socket.io-client";
import {backRequest, getUsers} from "../api/queries";
import Cookies from "js-cookie";

function Chat() {
    const token = Cookies.get('jwtToken');
    const socket = io('http://localhost:3333/chat', {
        auth: {
            token: token
        }
    });

    const {user, setUser} = useUser();
    const [selectedUser, setSelectedUser] = useState('');
    const [dm, setDm] = useState([]);
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        backRequest('chat/friends', 'GET').then((data) => {
            if (data.friends)
                setFriends(data.friends);
        })
    }, []);
    const [channels, setChannels] = useState([]);
    useEffect(() => {
        backRequest('chat/channels', 'GET').then((data) => {
            if (data.channels)
                setChannels(data.channels.MyChannels);
        })
    }, []);

    const [destroyWindowChat, setDestroyWindowChat] = useState(-1);
    const [displayChannelDrawer, setDisplayChannelDrawer] = useState(false);
    const [colorDrawer, setColorDrawer] = useState({drawer: "", text: "text-orangeNG"});
    const [drawerContent, setDrawerContent] = useState([]); // TODO change by friends after tests
    // ===========================================================
    const [users, setUsers] = useState([]);
    useEffect(() => {
        getUsers().then((data) => {
            const pseudos = data.map((user) => user.pseudo);
            setUsers(pseudos);
            setDrawerContent(pseudos);
        })
    }, []);
    // =============================================================
    const toggleDisplayChannel = () => {
        setDisplayChannelDrawer(displayChannelDrawer !== true)
    }

    useEffect(() => {
        setColorDrawer(displayChannelDrawer ?
            {drawer: "bg-[#E07A5F]", text: "text-white"} :
            {drawer: "", text: "text-orangeNG"});
        // TODO usercontext channels and friends
        setDrawerContent(displayChannelDrawer ? channels : users); // TODO change by friends after tests
    }, [displayChannelDrawer]);


    useEffect(() => {
        if (selectedUser && !dm.find(pseudo => pseudo === selectedUser))
            setDm([...dm, selectedUser]);
    }, [selectedUser]);

    useEffect(() => {
        if (destroyWindowChat != -1) {
            setDm((prevDm) =>
                prevDm.filter((dm, index) => index !== destroyWindowChat));
            setDestroyWindowChat(-1);
        }}, [destroyWindowChat]);

    return (
        <div className={"drawer drawer-end flex flex-col-reverse h-full items-end "}>
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <label htmlFor="my-drawer-4"
                       className="drawer-button btn btn-circle m-5 p-7">
                    <img src={Messagerie} alt={"chat"} className={"w-10"}/>
                </label>
            </div>
            <div className="drawer-side mt-16 flex flex-row-reverse">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay opacity-0"></label>
                <ul className={"menu p-4 w-60 min-h-full bg-base-200 text-base-content relative "  + colorDrawer.drawer}>
                    {drawerContent.map((pseudo, index) => (
                        <li key={index} className="flex flex-row justify-between">
                            <button className={"btn btn-ghost font-display " + colorDrawer.text}
                                    onClick={() => setSelectedUser(pseudo)}>{pseudo}
                            </button>
                            {!displayChannelDrawer && (
                                <button className="btn btn-square btn-ghost">
                                    <img src={Play} alt={"play"} className={"w-10"}/>
                                </button>
                            )}
                        </li>
                    ))}
                    <div className="self-center flex flex-row items-center justify-around mb-36 absolute bottom-0 border border-2 rounded-lg p-2">
                        <img src={Messagerie} alt={"chat"} className="mx-5 w-10"/>
                        <input type="checkbox"
                               className="toggle toggle-md"
                               defaultChecked={false}
                               onChange={toggleDisplayChannel}/>
                        <img src={Channel} alt={"channel"} className="mx-5 w-10"/>
                    </div>
                </ul>
                <div className="absolute mr-64 mb-32 bottom-0 flex flex-row-reverse">
                    {dm.map((userDm, index) => (
                            <div key={index} className="px-5">
                                <WindowChat user={userDm}
                                            me={user}
                                            destroyWindowChat={() => setDestroyWindowChat(index)}
                                            socket={socket}/>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
