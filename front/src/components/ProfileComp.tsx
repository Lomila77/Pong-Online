import React from 'react';
import MGameWatch from '../images/MGameWatch.png';

const ProfileComp: React.FC = () => {
  return (
    <div className="flex flex-col grid gap-5 justify-items-center">
      <div className="w-36 rounded-full avatar online ring ring-white ring-8 drop-shadow-md">
        <img src={MGameWatch} />
      </div>
      <div className="text-center">
        <span className="font-display text-2xl text-bleuPseudo pseudoProfil">Pitouch</span>
        <br></br>
        <span className="font-display text-sm text-vertOnLine">On line</span>
      </div>
      <div>
        
      </div>
    </div>
  );
};

export default ProfileComp;
