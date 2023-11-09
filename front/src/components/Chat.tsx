import React, { useEffect } from 'react';
import { useState } from 'react';
import WindowChat from "./WindowChat";
import { getUsers } from "../api/queries";

function Chat() {

    const [users, setUsers] = useState([])
    const [chatIsOpen, setChatIsOpen] = useState(false);
    const [windowIsOpen, setWindowIsOpen] = useState(false);

    const toggleChat = () => {
        setChatIsOpen(chatIsOpen !== true)
    }

    const toggleWindow = () => {
        setWindowIsOpen(windowIsOpen !== true)
    }

    useEffect(() => {
        // Utilisez useEffect pour charger les données des utilisateurs une fois que le composant est monté
        getUsers().then((data) => {
            setUsers(data);
        });
    }, []);

    return (
        <div className="drawer drawer-end flex flex-col-reverse h-full items-end">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle justify-center" />
            <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer-4" className="drawer-button btn btn-circle m-5 text-orangeNG text-xs font-display p-7 ">chat</label>
            </div>
            <div className="drawer-side mt-16 flex flex-row-reverse items-end">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay opacity-0"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content ">
                    {/* Sidebar content here */}
                    {users.map((user) => (
                        <li key={user.pseudo}><button className="btn btn-ghost font-display text-orangeNG" onClick={toggleWindow}>{user.pseudo}</button></li>
                    ))}
                    <li><button className="btn btn-ghost font-display text-orangeNG" onClick={toggleWindow}>User 1</button></li>
                    <li><button className="btn btn-ghost font-display text-orangeNG" onClick={toggleWindow}>User 2</button></li>

                </ul>
                {windowIsOpen && (
                   <WindowChat/>
                )}
            </div>
        </div>
    );
}

export default Chat;
