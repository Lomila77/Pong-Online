// @ts-ignore
import React, {useEffect, useState} from "react";
import {getMe} from "../api/queries";
import Message from "./Message";
import {io} from "socket.io-client";
import Send from "../images/send.svg"
import Cookies from "js-cookie";

function WindowChat({user, destroyChannel}) {
    const [messages, setMessages] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [me, setMe] = useState(null);
    const token = Cookies.get('jwtToken');
    const socket = io('http://localhost:3333/chat', {
        auth: {
            token: token
        }
    });
    useEffect(() => {
        getMe().then(data => setMe(data))
    }, []);

    useEffect(() => {
        socket.on('message', (msg) => {
            setMessages([...messages, msg]);
        });
        scrollToBottom();

        return () => {
            socket.disconnect();
        }
    }, [messages]);

    const sendMessage= () => {
        if (!message)
            return;
        socket.emit('message', message);
        setMessages([...messages, message]);
        setMyMessages([...myMessages, message]);
        setMessage('');
    }

    const scrollToBottom = () => {
        const messageContainer = document.getElementById('message-container' + user.pseudo);

        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };

    const isMyMessage = (msg) => {
        return myMessages.find(myMsg => {return myMsg === msg});
    }
    if (!user)
        return null;
    return (
        <div className="collapse bg-base-200 px-5 w-80 bottom-0">
            <input type="checkbox" className="h-4"/>
            <div className="collapse-title text-orangeNG font-display">
                {user.pseudo}
            </div>
            <div className="absolute top-0 right-0">
                <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                        onClick={destroyChannel}>
                    x
                </button>
            </div>
            <div id={"message-container" + user.pseudo} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-scroll">
                {messages.map((msg, index) => (
                    <Message srcMsg={msg}
                             srcAvatar={isMyMessage(msg) ? me.avatar : user.avatar}
                             srcPseudo={isMyMessage(msg) ? me.pseudo : user.pseudo}
                             myMessage={!!isMyMessage(msg)}
                             key={index}
                    />
                ))}
            </div>
            <div className="flex flex-row justify-between py-4">
                <input  className="input input-bordered input-sm max-w-xs w-60"
                        placeholder="Tapez votre message..."
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-circle btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                        onClick={sendMessage}><
                    img src={Send} alt="Send"/>
                </button>
            </div>
        </div>
    )
}
export default WindowChat;