import { useRef } from 'react';
import { useState } from 'react';
import Nemo from '../images/Nemo.jpg';
import { useNavigate } from "react-router-dom";

const ModalLogin = () => {
  const hiddenFileInput = useRef(null);
  const [file, setFile] = useState(Nemo);
  const [userName, setUserName] = useState('');
  const [toggle, setToggle] = useState(false);

  const [hidden, setHidden] = useState(true);

  const navigate = useNavigate();

  const uploadFile = (e) => {
    hiddenFileInput.current.click();
  };

  const handleChangeFile = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handlelChangeToggle = (e) => {
    setToggle(!toggle);
  };

  const handleSaveButton = (e) => {
    if (!userName) {
      setHidden(false);
    } else {
      setHidden(true);
      navigate("/home");
      console.log('SUBMIT');
      console.log('* Avatar file: ' + file);
      console.log('* Username: ' + userName);
      console.log('* 2FA: ' + toggle);
    }
  };

  return (
    <>
      <button
        className="btn btn-ghost bg-white text-black hover:bg-gray-200"
        onClick={() => window.my_modal_1.showModal()}
      >
        42 LOGIN
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <div className="flex">
            <div className="basis-1/2">
              <h1 className="font-display text-4xl">
                S'identifier
              </h1>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                onChange={handleChangeUserName}
                className="input input-bordered w-full mt-6"
              />
              <hr className="border-neutral-500 mt-5" />
              <div className="form-control mt-3">
                <label className="label cursor-pointer">
                  <span className="label-text text-base">
                    2FA
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-secondary"
                    onClick={handlelChangeToggle}
                  />
                </label>
              </div>
              <h1 className="label-text text-xs ml-1">
                L'authentification a deux facteurs permet de
                vous connecter en toute securite a votre
                compte afin de proteger vos donnees
                personnelles
              </h1>
              <div>
                <button
                  className="btn btn-secondary btn-block font-display mt-6"
                  onClick={(e) => handleSaveButton(e)}
                >
                  ENREGISTRER
                </button>
              </div>
            </div>
            <div className="avatar place-self-center ml-12">
              <div className="w-64 rounded-full ring ring-white ring-offset-base-100 ring-offset-2">
                <img src={file} />
              </div>
              <button
                className="Download bg-secondary rounded-full justify-center items-center"
                onClick={(e) => uploadFile(e)}
              >
                <svg
                  className=""
                  xmlns="http://www.w3.org/2000/svg"
                  height="35"
                  width="35"
                  viewBox="0 -960 960 960"
                  fill="white"
                >
                  <path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z" />
                </svg>
              </button>
              <input
                className="hidden"
                type="file"
                ref={hiddenFileInput}
                onChange={handleChangeFile}
              ></input>
            </div>
          </div>
          <div
            className={
              hidden === true
                ? 'alert alert-warning mt-4 bg-primary hidden'
                : 'alert alert-warning mt-4 bg-primary'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Attention: Veuillez entrer un nom
              d'utilisateur !
            </span>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={(e) => setHidden(true)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ModalLogin;
