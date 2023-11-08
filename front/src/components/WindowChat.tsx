// @ts-ignore
import React from "react";

function WindowChat(): React.FC {
    return (
        <div className="mb-32 mx-5">
            <div className="collapse bg-base-200">
                <input type="checkbox"/>
                <div className="collapse-title text-sm font-medium font-display">
                    bubble
                </div>
                <div className="collapse-content flex flex-col-reverse border hover:border-slate-400 rounded-lg">
                    <textarea placeholder="Tapez votre message..." className="textarea textarea-bordered textarea-xs w-full max-w-xs" ></textarea>

                    <div className="chat chat-start">
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                            </div>
                        </div>
                        <div className="chat-header">
                            Obi-Wan Kenobi
                            <time className="text-xs opacity-50">12:45</time>
                        </div>
                        <div className="chat-bubble">You were the Chosen One!</div>
                        <div className="chat-footer opacity-50">
                            Delivered
                        </div>
                    </div>

                    <div className="chat chat-end">
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                            </div>
                        </div>
                        <div className="chat-header">
                            Anakin
                            <time className="text-xs opacity-50">12:46</time>
                        </div>
                        <div className="chat-bubble">I hate you!</div>
                        <div className="chat-footer opacity-50">
                            Seen at 12:46
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default WindowChat;