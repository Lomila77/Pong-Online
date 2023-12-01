import {useEffect, useState} from "react";

function NewChannel({me, socket, close}) {
    const [formData, setFormData] = useState({
        name: '',
        isPrivate: false,
        isPassword: false,
        password: '',
        members: [],
        type: 'MyChannels'
    })

    useEffect(() =>
        setFormData(prevState => ({
            ...prevState,
            members: [...prevState.members, me]}
        )), []);

    const toggleCreateChannel = () => {
        socket.emit('JoinChannel', formData); // TODO: Appeler fonction luc
        close();
    }

    return (
            <div className="absolute modal-box left-1/3 top-1/4 p-8 ml-auto bg-[#E07A5F] text-white font-display">
                <h3 className="font-bold text-lg">Create your channel!</h3>
                <div className="modal-action w-full">
                    <form method="post" className={"flex flex-col"} onSubmit={toggleCreateChannel}>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Name:</label>
                            <input className="input input-bordered input-sm max-w-xs w-60 text-black"
                                   type={"text"}
                                   placeholder={"Title"}
                                   value={formData.name}
                                   onChange={(e) =>
                                       setFormData(prevFormData => ({
                                           ...prevFormData,
                                           name: e.target.value,
                                           }))}
                                   required={true}
                                   minLength={1}
                            />
                        </div>
                        <br/>
                        <div className={"flex flex-row justify-between items-center my-5 mx-5"}>
                            <label>Private ?</label>
                            <input className="input input-bordered input-sm max-w-xs w-10 checkbox"
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
                            <input className="input input-bordered input-sm max-w-xs w-10 checkbox"
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
                                           password: e.target.value,
                                       }))}
                                   minLength={1}
                                   disabled={!formData.isPassword}
                            />
                        </div>
                        <button className="btn text-orangeNG" type={"submit"}>Create</button>
                    </form>
                </div>
            </div>
    );
}

export default NewChannel;