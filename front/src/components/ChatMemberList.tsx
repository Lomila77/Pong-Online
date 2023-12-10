import React from "react";
import { IChannel } from "../context/ChatContext";

interface ChatMemberListProps {
    chat: IChannel;
    closeList: () => void;
}

const ChatMemberList: React.FC<ChatMemberListProps> = ({chat, closeList}) => {
    return (
        <div className={"absolute left-0 top-0 card h-full w-full bg-orangeNG shadow-xl"}>
            <div className="card-body flex flex-col overflow-auto">
                <h3 className={"font-display text-base-200"}>Member List:</h3>
                <ul className="bg-orangeNG rounded-box mt-5">
                    {chat.members.map((member, index) => (
                        <li key={index} className={"flex flex-row border-b-4 font-display justify-between items-center p-2"}>
                            <div className={"text-base-200"}>
                                {member.name}
                            </div>
                            <button className={"btn btn-error text-base-200 btn-xs"}>BLOCK</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="card-actions absolute bottom-5 right-5 my-2 font-display">
                <button className="btn btn-primary btn-sm bg-base-200" onClick={closeList}>Close Member</button>
            </div>
        </div>
    );
}

export default ChatMemberList;