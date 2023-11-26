import {useEffect, useState} from "react";

function NewChannel({socket, close, formData, setFormData}) {

    const toggleCreateChannel = () => {
        socket.emit('create channel', formData);
        close();
    }

    return (
            <div className="absolute modal-box left-1/3 top-1/4 p-8 ml-auto bg-[#E07A5F] text-white font-display">
                <h3 className="font-bold text-lg">Create your channel!</h3>
                <div className="modal-action w-full">
                    <form method="post" className={"flex flex-col"}>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Name:</label>
                            <input className="input input-bordered input-sm max-w-xs w-60 text-black"
                                   type={"text"}
                                   placeholder={"Title"}
                                   value={formData.chatName}
                                   onChange={(e) =>
                                       setFormData(prevFormData => ({
                                           ...prevFormData,
                                           chatName: e.target.value,
                                           }))}
                            />
                        </div>
                        <br/>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Private ?</label>
                            <input className="input input-bordered input-sm max-w-xs w-60"
                                   type={"checkbox"}
                                   checked={formData.isPrivate}
                                   onChange={(e) =>
                                       setFormData(prevFormData => ({
                                           ...prevFormData,
                                           isPrivate: (e.target.checked),
                                       }))}
                            />
                        </div>
                        <br/>
                            <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Password ?</label>
                            <input className="input input-bordered input-sm max-w-xs w-60"
                                   type={"checkbox"}
                                   checked={formData.isPassword}
                                   onChange={(e) =>
                                       setFormData(prevFormData => ({
                                           ...prevFormData,
                                           isPassword: (e.target.checked),
                                       }))}
                            />
                        </div>
                        <br/>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Password:</label>
                            <input className="input input-bordered input-sm max-w-xs w-60 text-black"
                                   type={"password"}
                                   placeholder={"abcde"}
                                   onChange={(e) =>
                                       setFormData(prevFormData => ({
                                           ...prevFormData,
                                           Password: e.target.value,
                                       }))}

                            />
                        </div>
                        <br/>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Friends:</label>
                            <input className="input input-bordered input-sm max-w-xs w-60 text-black"
                               placeholder="Friend1, Friend2, ..."
                               type="text"
                               value={formData.members}
                               onChange={(e) =>
                                   setFormData(prevFormData => ({
                                       ...prevFormData,
                                       members: e.target.value.split(' '),
                               }))}
                               />
                        </div>
                        <button className="btn text-orangeNG" onClick={toggleCreateChannel}>Create</button>
                    </form>
                </div>
            </div>
    );
}

export default NewChannel;