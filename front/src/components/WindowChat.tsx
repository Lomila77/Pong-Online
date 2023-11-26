// @ts-ignore
import React, { useEffect, useState } from "react";
import { getMessage } from "../api/queries";
import Message from "./Message";
import Send from "../images/send.svg"

function WindowChat({user, me, destroyChannel, socket}) {
    const [messages, setMessages] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    socket.emit('CreateDm', {target: user, msg: message});

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    useEffect(() => {
        socket.on('update', (data) => {
            if (data === 'chan updated') {
                getMessage().then(data =>
                    setMessages([...messages, data]))
            }
            scrollToBottom();
        });

        //return () => {
        //    socket.disconnect();
        //}
    }, []);

    useEffect(() => {

    }, [messages]);

    const sendMessage = () => {
        if (!message)
            return;
        socket.emit('message', message);
        setMessages([...messages, message]);
        setMyMessages([...myMessages, message]);
        setMessage('');
    }

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
            <div className="absolute top-0 right-0">
                <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                        onClick={destroyChannel}>
                    x
                </button>
            </div>
            <div id={"message-container" + user} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-scroll">
                {messages.map((msg, index) => (
                    <Message srcMsg={msg}
                             srcPseudo={isMyMessage(msg) ? me.pseudo : user}
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
export default WindowChat;
