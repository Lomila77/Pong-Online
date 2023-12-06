import React, { useEffect, useState } from "react";
import Message from "./Message";
import Send from "../images/send.svg"
import Cross from "../images/cross.svg"
import Setting from "../images/setting.svg"
import {useChat} from "../context/ChatContext";

function WindowChannel({chat, destroyChannel}) {
    const { sendMessage, sendAdminForm } = useChat();
    const [messages, setMessages] = useState(chat.history);
    const [myMessages, setMyMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [displayParam, setDisplayParam] = useState(false);
    const [errorAdminData, setErrorAdminData] = useState(false);
    const [adminData, setAdminData] = useState({
        target: '',
        mute: false,
        kick: false,
        ban: false,
    })

    useEffect(() => {
        if (adminData?.target) {
            if (!chat.members.find(member => member.name == adminData.target))
                setErrorAdminData(true);
            else
                setErrorAdminData(false);
        } else if (!adminData?.target)
            setErrorAdminData(false);
    }, [adminData]);



    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const openParam = () => {setDisplayParam(true);}

    const closeParam = () => {setDisplayParam(false);}

    const sendAdminData = () => {
        sendAdminForm(chat.id, chat.members.find(member => member.name == adminData.target).id, adminData.mute, adminData.ban, adminData.kick);
    }


    const handleSendMessage = () => {
        sendMessage(message, chat.id);
        setMessage('');
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        const messageContainer = document.getElementById('message-container'); // TODO fix comme chez windowchat
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };

    const isMyMessage = (msg) => {
        return myMessages.find(myMsg => { return myMsg === msg });
    }

    return (
        <div className={`collapse bg-orangeNG px-5 w-96 window-chat ${isChecked ? 'checked' : ''}`}>
            <input type="checkbox" className="h-4" checked={isChecked} onChange={handleCheckboxChange}/>
            <div className="collapse-title text-white font-display">
                {chat.name}
            </div>
            <div className="absolute top-0 right-0">
                <div className="absolute top-0 right-0 flex flex-row-reverse z-10">
                    <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center"
                            onClick={destroyChannel}>
                        <img src={Cross} alt={"cross"} className={"p-2"}/>
                    </button>
                    <div className="dropdown dropdown-end">
                        <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center mx-1">
                            <img src={Setting} alt={"setting"} className={"p-2"}/>
                        </button>
                        {!displayParam && (
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li><button onClick={openParam}>Settings</button></li>
                                {//chat.owner.id == me.fortytwo_id (
                                    //    <li><a>Item 2</a></li>
                                    //)
                                }
                            </ul>
                        )}

                    </div>
                </div>
            </div>
            {displayParam && (
                <div className="absolute card h-full w-full bg-orangeNG shadow-xl">
                    <div className="card-body flex flex-col">
                        <h2 className="card-title font-display text-white">Settings:</h2>
                        <div className={"flex flex-col justify-between items-center"}>
                            <h4 className={"font-display py-2 text-white"}>Choose!</h4>
                            <div className={"flex flex-col justify-between items-center my-2 mx-5"}>
                                <label htmlFor={"targetAdminData"} className={"font-display text-white"}>Member: </label>
                                <input id={"targetAdminData"}
                                       className={"input input-bordered input-sm max-w-xs w-64 checkbox " +
                                            (errorAdminData ? "border-rose-500 " : "") +
                                            (!errorAdminData && adminData.target ? "border-green-400" : "")}
                                       type={"text"}
                                       value={adminData.target}
                                       required={true}
                                       minLength={1}
                                       onChange={(e) => (
                                           setAdminData(prevState => ({
                                               ...prevState,
                                               target: (e.target.value),
                                           })) &&
                                           setErrorAdminData(false)
                                   )}
                                />
                                {errorAdminData && (
                                    <label htmlFor={"targetAdminData"} className={"font-display text-rose-500 text-xs mt-2"}>Not find in this chan</label>
                                )}
                                {!errorAdminData && adminData.target && (
                                    <label htmlFor={"targetAdminData"} className={"font-display text-green-400 text-xs mt-2"}>Founded</label>
                                )}
                                {!errorAdminData && adminData.target == '' && (
                                    <label htmlFor={"targetAdminData"} className={"font-display text-base-200 text-xs mt-2"}>Enter a pseudo</label>
                                )}
                            </div>
                            <div className={"flex flex-row justify-between items-center my-2 mx-5"}>
                                <label htmlFor={"muteAdminData"} className={"font-display text-white"}>Mute: </label>
                                <input id={"muteAdminData"}
                                       className="input input-bordered input-sm max-w-xs w-10 checkbox"
                                       type={"checkbox"}
                                       checked={adminData.mute}
                                       onChange={(e) =>
                                           setAdminData(prevState => ({
                                               ...prevState,
                                               mute: (e.target.checked),
                                           }))}
                                />
                            </div>
                            <div className={"flex flex-row justify-between items-center my-2 mx-5"}>
                                <label htmlFor={"kickAdminData"} className={"font-display text-white"}>Kick: </label>
                                <input id={"kickAdminData"}
                                       className="input input-bordered input-sm max-w-xs w-10 checkbox"
                                       type={"checkbox"}
                                       checked={adminData.kick}
                                       onChange={(e) =>
                                           setAdminData(prevState => ({
                                               ...prevState,
                                               kick: (e.target.checked),
                                           }))}
                                />
                            </div>
                            <div className={"flex flex-row justify-between items-center my-2 mx-5"}>
                                <label htmlFor={"banAdminData"} className={"font-display text-white"}>Ban: </label>
                                <input id={"banAdminData"}
                                       className="input input-bordered input-sm max-w-xs w-10 checkbox"
                                       type={"checkbox"}
                                       checked={adminData.ban}
                                       onChange={(e) =>
                                           setAdminData(prevState => ({
                                               ...prevState,
                                               ban: (e.target.checked),
                                           }))}
                                />
                            </div>
                        </div>
                        <br/>
                        <div className="card-actions justify-end my-2">
                            <button className={"btn btn-primary bg-base-200"} onClick={sendAdminData}>Send</button>
                            <button className="btn btn-primary bg-base-200" onClick={closeParam}>Close param</button>
                        </div>
                    </div>
                </div>
            )}
            <div id={"message-container"} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-scroll">
                {messages && messages.map((msg, index) => ( //TODO changer message par la bonne strategie
                    <Message srcMsg={msg.content}
                             srcPseudo={msg.owner.name} // TODO recuperer l'objet message et afficher le bon interlocuteur
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
                        onClick={handleSendMessage}>
                    <img src={Send} alt="Send" />
                </button>
            </div>
        </div>
    )
}
export default WindowChannel;