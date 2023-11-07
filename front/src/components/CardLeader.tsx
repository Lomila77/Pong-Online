import React from 'react';
import ProfileModal from './ProfileComp';

const CardLeader: React.FC = () => {
  const DisplayProfile = () => {
    document.getElementById('my_modal_3').showModal();
  };

  return (
    <div>
      <div className="card card-side card-bordered bg-navbar border-white border-4 shadow-xl flex flex-row h-[3rem]">
        <div className="bg-orangeNG font-display text-white text-center basis-1/5 pt-2">
          1
        </div>
        <div className="text-center basis-3/5 mt-2">
          <span className="font-display text-bleuPseudo cursor-pointer" onClick={DisplayProfile}>Pitouch</span>
        </div>
        <div className="bg-bleuPseudo font-display text-center text-white basis-1/5 pt-2">
          5 wins
        </div>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box shrink w-64">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div>
            <ProfileModal />
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CardLeader;
