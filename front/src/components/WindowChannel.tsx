import React, { useEffect, useState } from "react";
import { getMessage } from "../api/queries";
import Message from "./Message";
import Send from "../images/send.svg"
import Cross from "../images/cross.svg"

function WindowChannel({chat, me, destroyChannel, socket}) {
    const [messages, setMessages] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    socket.emit('create channel', {chat}); //TODO ai-je besoin d'envoyer les param un a un ou comme ca c bon ?

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    useEffect(() => {
        socket.on('update', (data) => { // TODO update chan ?
            if (data === 'chan updated') { // TODO it is right func ?
                getMessage().then(data =>
                    setMessages([...messages, data]))
            }
            scrollToBottom();
        });

        //return () => {
        //    socket.disconnect();
        //}
    }, []);


    const sendMessage = () => {
        if (!message)
            return;
        socket.emit('message', message); // TODO send message to channel
        setMessages([...messages, message]);
        setMyMessages([...myMessages, message]);
        setMessage('');
    }

    const scrollToBottom = () => {
        const messageContainer = document.getElementById('message-container' + user); // TODO fix comme chez windowchat
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };

    const isMyMessage = (msg) => {
        return myMessages.find(myMsg => { return myMsg === msg });
    }

    return (
        <div className={`collapse bg-base-200 px-5 w-80 window-chat ${isChecked ? 'checked' : ''}`}>
            <input type="checkbox" className="h-4" checked={isChecked} onChange={handleCheckboxChange}/>
            <div className="collapse-title text-orangeNG font-display">
                {chat.chatName}
            </div>
            <div className="absolute top-0 right-0">
                <div className="absolute top-0 right-0 flex flex-row-reverse z-10">
                    <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                            onClick={destroyChannel}>
                        <img src={Cross} alt={"cross"} className={"p-2"}/>
                    </button>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center mx-1">
                            <img src={Cross} alt={"profil"} className={""}/> {//TODO change Cross by settings
                        }
                        </div>
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li><a>Item 1</a></li>
                            <li><a>Item 2</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div id={"message-container" + chat.chatName} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-scroll">
                {messages.map((msg, index) => (
                    <Message srcMsg={msg}
                             srcPseudo={isMyMessage(msg) ? me.pseudo : chat.chatName} // TODO changer chat name par personne qui parle: comment faire ?
                             myMessage={!!isMyMessage(msg)}
                             key={index}
                    />
                ))}
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
export default WindowChannel;