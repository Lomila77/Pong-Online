import React from "react";

function Message({srcAvatar, srcPseudo, srcMsg, myMessage, index}) {
    let classNameMessage = "chat chat-start";
    if (myMessage)
        classNameMessage= "chat chat-end"
    return (
        <div className={classNameMessage} key={index}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img src={srcAvatar} />
                </div>
            </div>
            <div className="chat-header">
                {srcPseudo}
                <time className="text-xs opacity-50">12:45</time>
            </div>
            <div className="chat-bubble">{srcMsg}</div>
            <div className="chat-footer opacity-50">
                Delivered
            </div>
        </div>
    )
}

export default Message;