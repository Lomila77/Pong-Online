import React, { useEffect, useState } from "react";
import Message from "./Message";
import Send from "../images/send.svg"
import Cross from "../images/cross.svg"
import Setting from "../images/setting.svg"
import BlockUser from "../images/blockUser.svg"
import AddFriend from "../images/addFriend.svg"
import {useChat} from "../context/ChatContext";
import {useUser} from "../context/UserContext";

function WindowChannel({chat, destroyChannel}) {
    const {user, setUser} = useUser();                                                                      // Recuperation de la session de l'utilisateur
    const { sendMessage, sendAdminForm } = useChat();
    const [message, setMessage] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [displayParam, setDisplayParam] = useState(false);
    const [displayMemberList, setDisplayMemberList] = useState(false);
    const [displayAddFriend, setDisplayAddFriend] = useState(false);
    const [displaySettings, setDisplaySettings] = useState(false);
    const [errorAdminData, setErrorAdminData] = useState(false);
    const [adminData, setAdminData] = useState({
        target: '',
        mute: false,
        kick: false,
        ban: false,
    })
    const [addFriendPseudo, setAddFriendPseudo] = useState('');

    useEffect(() => {
        if (adminData?.target) {
            if (!chat.members.find(member => member.name == adminData.target))
                setErrorAdminData(true);
            else
                setErrorAdminData(false);
        } else if (!adminData?.target)
            setErrorAdminData(false);
    }, [adminData]);

    const handleAddFriend = () => {
        if (addFriendPseudo)
            ;//TODO appeler luc fonction qui prends le pseudo
    }



    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const toggleAddFriend = () => {setDisplayAddFriend(displayAddFriend !== true)};
    const toggleDisplaySettings = () => {setDisplaySettings(displaySettings !== true)}

    const openParam = () => {setDisplayParam(true); setDisplayMemberList(false);};
    const openMemberList = () => {setDisplayMemberList(true); setDisplayParam(false);};


    const closeParam = () => {setDisplayParam(false);};
    const closeMemberList = () => {setDisplayMemberList(false);};


    const sendAdminData = () => {
        sendAdminForm(chat.id, chat.members.find(member => member.name == adminData.target).id, adminData.mute, adminData.ban, adminData.kick);
    }


    const handleSendMessage = () => {
        sendMessage(message, chat.id);
        setMessage('');
    }

    useEffect(() => {
        scrollToBottom();
    }, [chat?.history]);

    const scrollToBottom = () => {
        const messageContainer = document.getElementById('message-container'); // TODO fix comme chez windowchat
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };

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
                        <button className={"btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center mx-1"}
                                onClick={toggleDisplaySettings}>
                            <img src={Setting} alt={"setting"} className={"p-1"}/>
                        </button>
                        {displaySettings && (
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52 text-orangeNG font-display">
                                <li><button onClick={openMemberList}>Members</button></li>
                                {/*chat.owner.id == user.fortytwo_id &&*/  (
                                    <li><button onClick={openParam}>Settings</button></li>
                                )}
                            </ul>
                        )}
                    </div>
                    <div className="dropdown dropdown-end">
                        <button onClick={toggleAddFriend} className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center">
                            <img src={AddFriend} alt={"addFriend"} className={"p-1"}/>
                        </button>
                        {displayAddFriend && (
                            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-72 text-orangeNG font-display">
                                <label htmlFor={"AddFriend"} className={"font-display text-orangeNG p-2"}>Friend pseudo: </label>
                                <div className={"flex flex-row justify-between p-2"}>
                                    <input id={"AddFriend"}
                                           className={"input input-bordered input-sm max-w-xs w-52"}
                                           type={"text"}
                                           value={adminData.target}
                                           required={true}
                                           minLength={1}
                                           onChange={(e) => (
                                               setAddFriendPseudo((e.target.value)))}/>
                                    <button className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center">
                                        <img src={AddFriend} alt={"addFriend"} className={"p-1"}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {displayMemberList && (
                <div className={"absolute card h-full w-full bg-orangeNG shadow-xl"}>
                    <div className="card-body flex flex-col overflow-auto">
                        <ul className="bg-orangeNG rounded-box mt-5">
                            {chat.members.map(member => (
                                <li className={"flex flex-row border-b-4 font-display justify-between items-center p-2"}>
                                    <div className={"text-base-200"}>
                                        {member.name}
                                    </div>
                                    <button className={"btn btn-error text-base-200 btn-xs"}>BLOCK</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card-actions absolute bottom-5 right-5 my-2 font-display">
                        <button className="btn btn-primary btn-sm bg-base-200" onClick={closeMemberList}>Close Member</button>
                    </div>
                </div>
            )}
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
                        <div className="card-actions absolute bottom-5 right-5 my-2">
                            <button className={"btn btn-sm bg-base-200 font-display"} onClick={sendAdminData}>Send</button>
                            <button className="btn btn-sm bg-base-200 font-display" onClick={closeParam}>Close param</button>
                        </div>
                    </div>
                </div>
            )}
            <div id={"message-container"} className="border hover:border-slate-400 rounded-lg h-80 flex flex-col overflow-auto">
                {chat?.history && chat.history.map((msg, index) => ( //TODO changer message par la bonne strategie
                    <Message message={msg}
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