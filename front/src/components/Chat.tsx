import React, { useEffect } from 'react';
import { useState } from 'react';
import WindowChat from "./WindowChat";
import {getUsers} from "../api/queries";
import Messagerie from "../images/chat.svg";

function Chat() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [channels, setChannels] = useState([]);
    const [destroyChannel, setDestroyChannel] = useState(-1);

    useEffect(() => {
        getUsers().then((data) => {
            setUsers(data);
        });
    }, []);

    useEffect(() => {
        if (selectedUser && !channels.find(user => user.pseudo === selectedUser.pseudo))
            setChannels([...channels, selectedUser]);
    }, [selectedUser]);

    useEffect(() => {
        if (destroyChannel != -1) {
            setChannels((prevChannels) =>
                prevChannels.filter((channel, index) => index !== destroyChannel));
            setDestroyChannel(-1);
        }}, [destroyChannel]);

    return (
        <div className="drawer drawer-end flex flex-col-reverse h-full items-end">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <label htmlFor="my-drawer-4"
                       className="drawer-button btn btn-circle m-5 text-orangeNG text-xs font-display p-7 justify-center">
                    <img src={Messagerie} alt={"chat"}/>
                </label>
            </div>
            <div className="drawer-side mt-16 flex flex-row-reverse items-end">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay opacity-0"></label>
                <ul className="menu p-4 w-60 min-h-full bg-base-200 text-base-content">
                    {users.map((user, index) => (
                        <li key={index}>
                            <button className="btn btn-ghost font-display text-orangeNG"
                                    onClick={() => setSelectedUser(user)}>{user.pseudo}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mb-32 flex flex-row-reverse">
                    {channels.map((userChannel, index) => (
                            <div key={index} className="px-5">
                                <WindowChat user={userChannel} destroyChannel={() => setDestroyChannel(index)}/>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
