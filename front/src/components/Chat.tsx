import React from 'react';
import { useState } from 'react';

function Chat(): React.FC {
    const [chatIsOpen, setChatIsOpen] = useState(false);

    const toggleChat = () => {
        setChatIsOpen(chatIsOpen !== true)
    }

    return (
        <div className="drawer drawer-end flex-col-reverse h-full items-end">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle justify-center" />
            <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer-4" className="drawer-button btn btn-circle m-5 text-orangeNG text-xs font-display p-7 ">chat</label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    {/* Sidebar content here */}
                    <li><a>Sidebar Item 1</a></li>
                    <li><a>Sidebar Item 2</a></li>
                </ul>
            </div>
        </div>
    );
}

export default Chat;
