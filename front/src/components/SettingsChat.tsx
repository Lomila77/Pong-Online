import React, {useEffect, useState} from "react";
import {useChat} from "../context/ChatContext";
function SettingsChat({chat, closeSettings}) {
    const { sendAdminForm } = useChat();
    const [errorAdminData, setErrorAdminData] = useState(false);
    const [selectedMuteOption, setSelectedMuteOption] = useState('unMute');
    const [selectedBanOption, setSelectedBanOption] = useState('unBan');
    const [adminData, setAdminData] = useState({
        target: '',
        unMute: false,
        mute: false,
        kick: false,
        unBan: false,
        ban: false,
        admin: false,
        isPassword: chat.isPassword,
        password: '',
    });

    useEffect(() => {
        if (adminData?.target) {
            if (!chat.members.find(member => member.name == adminData.target))
                setErrorAdminData(true);
            else
                setErrorAdminData(false);
        } else if (!adminData?.target)
            setErrorAdminData(false);
    }, [adminData]);

    const sendAdminData = () => {
        selectedMuteOption == "mute" ?
            setAdminData(prevState => ({...prevState, mute: true})) :
            setAdminData(prevState => ({...prevState, unMute: true}));
        selectedBanOption == "ban" ?
            setAdminData(prevState => ({...prevState, ban: true})) :
            setAdminData(prevState => ({...prevState, unBan: true}));
        sendAdminForm(chat.id, chat.members.find(member => member.name == adminData.target).id,
            adminData.mute, adminData.unMute,
            adminData.ban, adminData.unBan,
            adminData.kick, adminData.admin,
            adminData.isPassword, adminData.password);
        setAdminData(prevState => ({
            ...prevState,
            target: '',
            mute: false, unMute: false,
            ban: false, unBan: false,
            kick: false, admin: false,
            isPassword: chat.isPassword, password: '',}))
    }
    return (
        <div className="absolute top-0 left-0 card h-full w-full bg-orangeNG shadow-xl">
            <div className="card-body flex flex-col">
                <h2 className="card-title font-display text-white">Settings:</h2>
                <div className={"flex flex-col justify-between items-center"}>
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
                        <div className={"flex flex-row px-4"}>
                            <label htmlFor={"unMuteAdminData"} className={"font-display text-white"}>Unmute: </label>
                            <input id={"unMuteAdminData"}
                                   className="radio"
                                   type={"radio"}
                                   value={"unMute"}
                                   checked={(selectedMuteOption == "unMute")}
                                   onChange={(e) =>
                                       setSelectedMuteOption(e.target.value)}
                            />
                        </div>
                        <div className={"flex flex-row px-4"}>
                            <label htmlFor={"muteAdminData"} className={"font-display text-white"}>Mute: </label>
                            <input id={"muteAdminData"}
                                   className="radio"
                                   type={"radio"}
                                   value={"mute"}
                                   checked={(selectedMuteOption == "mute")}
                                   onChange={(e) =>
                                       setSelectedMuteOption(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={"flex flex-row justify-between items-center my-2 mx-5 px-5"}>
                        <div className={"flex flex-row px-4"}>
                            <label htmlFor={"unBanAdminData"} className={"font-display text-white"}>Unban: </label>
                            <input id={"unBanAdminData"}
                                   className="radio"
                                   type={"radio"}
                                   value={"unBan"}
                                   checked={(selectedBanOption == "unBan")}
                                   onChange={(e) =>
                                       setSelectedBanOption(e.target.value)}
                            />
                        </div>
                        <div className={"flex flex-row px-4"}>
                            <label htmlFor={"banAdminData"} className={"font-display text-white"}>Ban: </label>
                            <input id={"BanAdminData"}
                                   className="radio"
                                   type={"radio"}
                                   value={"ban"}
                                   checked={(selectedBanOption == "ban")}
                                   onChange={(e) =>
                                       setSelectedBanOption(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={"flex flex-row justify-between items-center my-2 mx-5"}>
                        <label htmlFor={"kickAdminData"} className={"font-display text-white"}>Kick: </label>
                        <input id={"kickAdminData"}
                               className="checkbox"
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
                        <label htmlFor={"adminAdminData"} className={"font-display text-white"}>Admin role: </label>
                        <input id={"adminAdminData"}
                               className="checkbox"
                               type={"checkbox"}
                               checked={adminData.admin}
                               onChange={(e) =>
                                   setAdminData(prevState => ({
                                       ...prevState,
                                       admin: (e.target.checked),
                                   }))}
                        />
                    </div>
                    <div className={"flex flex-row justify-between items-center"}>
                        <div className={"flex flex-row mx-2"}>
                            <label className={"font-display text-white"}>Pwd:</label>
                            <input className="checkbox"
                                   type={"checkbox"}
                                   checked={chat.isPassword}
                                   onChange={(e) =>
                                       setAdminData(prevState => ({
                                           ...prevState,
                                           isPassword: (e.target.checked),
                                       }))}
                            />
                        </div>
                        <div className={"mx-2"}>
                            <input className="input input-bordered input-sm max-w-xs w-54 text-black"
                                   type={"password"}
                                   onChange={(e) =>
                                       setAdminData(prevState => ({
                                           ...prevState,
                                           password: e.target.value,
                                       }))}
                                   minLength={1}
                                   disabled={!adminData.isPassword}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-actions absolute bg-orangeNG bottom-5 right-5">
                    <button className={"btn btn-sm bg-base-200 font-display"} onClick={sendAdminData}>Send</button>
                    <button className="btn btn-sm bg-base-200 font-display" onClick={closeSettings}>Close param</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsChat;