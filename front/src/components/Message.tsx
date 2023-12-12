import React, {useState} from "react";
import {useUser} from "../context/UserContext";
import { IChatHistory } from "../context/ChatContext";

interface MessageProps {
    message: IChatHistory;
}

const Message: React.FC<MessageProps> = ({message}) => {
    const {user, setUser} = useUser();
    if (!user)
        return;
   /* let classNameMessage = "chat chat-start";
    if (message.owner.id == user.fortytwo_id)
        classNameMessage= "chat chat-end"
    return (
        <div className={classNameMessage} key={key}>
            <div className="chat-header">
                {message.owner.name}
                <time className="text-xs opacity-50">12:45</time>
            </div>*/
    const classNameMessage = message.owner.id == user.fortytwo_id ? "chat chat-end" : "chat chat-start";
    return (
        <div className={classNameMessage}>
            <div className="chat-header">
                {message.owner.name}
                {// TODO set time message <time className="text-xs opacity-50">12:45</time>
                }
            </div>
            <div className="chat-bubble">{message.content}</div>
            <div className="chat-footer opacity-50">
                Delivered
            </div>
        </div>
    )
    /*const getChatBubbleWithUrlOrNot = (content: string): JSX.Element => {
        const splitContent = content.split(' ');
        const regex = new RegExp(/(https?:\/\/[^\s]+)/g);
        const contentWithUrl = splitContent.map((word: string, index: number) => {
            if (word.match(regex)) {
                return (
                    <a href={word} target="_blank" rel="noreferrer" key={index}>
                        {word}
                    </a>
                )
            }
            return word + ' ';
        })
        return (
            <div className="chat-bubble break-all">
                {contentWithUrl}
            </div>
        )
    }


    return (
        <div className={classNameMessage} key={key}>
            <div className="chat-header">
                {message.owner.name}
                <time className="text-xs opacity-50">12:45</time>
            </div>
            {getChatBubbleWithUrlOrNot(message.content)}
            <div className="chat-footer opacity-50">
                Delivered
            </div>
        </div>
    )
*/
}

export default Message;