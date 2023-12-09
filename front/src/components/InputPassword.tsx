import React, {useState} from "react";
import Check from "../images/check.svg"
function InputPassword({chat, unblockFunc}) {
    const [chatPassword, setChatPassword] = useState('');

    const checkChatPassword = () => {
        if (chatPassword)
            ;//TODO appeler fonction luc pour check le password
        // set le unblock a true si chat password est bon
    }
    return (
        <div className={"h-80 flex flex-col justify-center"}>
            <label htmlFor={"ChatPassword"} className={"font-display text-base-200 p-2 py-5"}>Enter Password: </label>
            <div className={"flex flex-row justify-between p-2"}>
                <input id={"ChatPassword"}
                       className={"input input-ml max-w-xs w-56 font-display"}
                       type={"password"}
                       value={chatPassword}
                       required={true}
                       minLength={1}
                       onChange={(e) => (
                           setChatPassword((e.target.value)))}/>
                <button onClick={checkChatPassword} className="btn btn-square btn-ml btn-ghost ring ring-white ring-offset-base-100 content-center font-display">
                    <img src={Check} alt={"Check"}/>
                </button>
            </div>
        </div>
    );
}

export default InputPassword;