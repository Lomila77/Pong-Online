// @ts-ignore
import React, { useEffect, useState } from "react";
import { backRequest } from "../api/queries";
import ProfileComp from "./ProfileComp";
import Message from "./Message";
import Send from "../images/send.svg"
import Profil from "../images/profil.svg"
import Cross from "../images/cross.svg"

function WindowChat({user, me, destroyChat, socket}) {
    // Liste des messages recu et envoyees
    const [messages, setMessages] = useState([]);
    // Liste de mes messages
    const [myMessages, setMyMessages] = useState([]);
    // Message a envoyer
    const [message, setMessage] = useState('');

    const [isChecked, setIsChecked] = useState(false);

    const [displayUserProfil, setDisplayUserProfil] = useState(false);
    const [userProfil, setUserProfil] = useState(null);

    //socket.emit('create channel', {pseudo2: user}); // TODO: Create Channel
    useEffect(() => {
        backRequest('users/user', 'PUT', {pseudo: user}).then(data => {
            setUserProfil(data);
        })
    }, []);

    const toggleDisplayUserProfil = () => {
        setDisplayUserProfil(displayUserProfil !== true);
    }

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const sendMessage = () => {
        if (!message)
            return;
        socket.emit('sendMessage', {message: message});
        setMessages([...messages, message]);
        setMyMessages([...myMessages, message]);
        setMessage('');
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    //TODO no usage ?!
    const scrollToBottom = () => {
        const messageContainer = document.getElementById('message-container' + user);
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };

    const isMyMessage = (msg) => {
        return myMessages.find(myMsg => { return myMsg === msg });
    }
    if (!user)
        return null;
    return (
        <div className={`collapse bg-base-200 px-5 w-80 window-chat ${isChecked ? 'checked' : ''}`}>
            <input type="checkbox" className="h-4" checked={isChecked} onChange={handleCheckboxChange}/>
            <div className="collapse-title text-orangeNG font-display">
                {user}
            </div>
            <div className="absolute top-0 right-0 flex flex-row-reverse z-10">
                <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                        onClick={destroyChat}>
                    <img src={Cross} alt={"cross"} className={"p-2"}/>
                </button>
                <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center mx-1"
                        onClick={toggleDisplayUserProfil}>
                    <img src={Profil} alt={"profil"} className={""}/>
                </button>
            </div>
            <div className={""}>
                {displayUserProfil && (
                    <ProfileComp user={userProfil}/>
                )}
                {!displayUserProfil && (
                    <div id={"message-container" + user} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-scroll">
                        {messages.map((msg, index) => (
                            <Message srcMsg={msg}
                                     srcPseudo={isMyMessage(msg) ? me.pseudo : user}
                                     myMessage={!!isMyMessage(msg)}
                                     key={index}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-row justify-between py-4">
                <input className="input input-bordered input-sm max-w-xs w-60"
                    placeholder="Tapez votre message..."
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-circle btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                    onClick={sendMessage}><
                        img src={Send} alt="Send" />
                </button>
            </div>
        </div>
    )
}
export default WindowChat;
