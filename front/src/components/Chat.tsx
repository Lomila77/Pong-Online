import React, { useEffect } from 'react';
import { useState } from 'react';
import WindowChat from "./WindowChat";
import {getUsers, User} from "../api/queries";

function Chat() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [channelUser, setChannelUser] = useState([])
    const [channels, setChannels] = useState([]);


    useEffect(() => {
        getUsers().then((data) => {
            setUsers(data);
        });
    }, []);

    useEffect(() => {
        if (selectedUser && !channelUser.find(user => user.pseudo === selectedUser.pseudo))
            setChannelUser([...channelUser, selectedUser]);
    }, [selectedUser]);

    useEffect(() => {
        setChannels([...channels, selectedUser])
    }, [channelUser]);


    return (
        <div className="drawer drawer-end flex flex-col-reverse h-full items-end border border-2">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <label htmlFor="my-drawer-4" className="drawer-button btn btn-circle m-5 text-orangeNG text-xs font-display p-7">chat</label>
            </div>
            <div className="drawer-side mt-16 flex flex-row-reverse items-end">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay opacity-0"></label>
                <ul className="menu p-4 w-60 min-h-full bg-base-200 text-base-content">
                    {users.map((user) => (
                        <li key={user.pseudo}><button className="btn btn-ghost font-display text-orangeNG" onClick={() => setSelectedUser(user)}>{user.pseudo}</button></li>
                    ))}
                </ul>
                <div className="mb-32 flex flex-row-reverse">
                    {channels.map((userChannel) => (
                        userChannel && (
                            <div key={userChannel.pseudo} className="px-5">
                                <WindowChat user={userChannel}/>
                            </div>
                        )
                    ))}

                </div>
            </div>
        </div>
    );
}

export default Chat;
