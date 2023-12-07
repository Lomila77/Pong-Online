import React, {useState} from "react";

function InputPassword({chat, unblockFunc}) {
    const [chatPassword, setChatPassword] = useState('');

    const checkChatPassword = () => {
        if (chatPassword)
            ;//TODO appeler fonction luc pour check le password
        // set le unblock a true si chat password est bon
    }
    return (
        <div>
            <label htmlFor={"ChatPassword"} className={"font-display text-orangeNG p-2"}>Enter Password: </label>
            <div className={"flex flex-row justify-between p-2"}>
                <input id={"ChatPassword"}
                       className={"input input-bordered input-sm max-w-xs w-52"}
                       type={"text"}
                       value={chatPassword}
                       required={true}
                       minLength={1}
                       onChange={(e) => (
                           setChatPassword((e.target.value)))}/>
                <button onClick={checkChatPassword} className="btn btn-square btn-sm btn-ghost ring ring-white ring-offset-base-100 content-center">
                    SEND
                </button>
            </div>
        </div>
    );
}

export default InputPassword;