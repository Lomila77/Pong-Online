import React from "react";
import {useUser} from "../context/UserContext";



function Message({message, index}) {
    const {user} = useUser()
    let classNameMessage = "chat chat-start";
    if (message.owner.id == user.fortytwo_id)
        classNameMessage= "chat chat-end"
    return (
        <div className={classNameMessage} key={index}>
            <div className="chat-header">
                {message.owner.name}
                <time className="text-xs opacity-50">12:45</time>
            </div>
            <div className="chat-bubble">{message.content}</div>
            <div className="chat-footer opacity-50">
                Delivered
            </div>
        </div>
    )
}

export default Message;
