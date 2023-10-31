import React from 'react';
import { authentificationAPI42, AuthResponse } from '../api/queries';

const ButtonLogin: React.FC = () => {

    const handleClick = async () => {
        try {
          const data: AuthResponse = await authentificationAPI42();
          console.log("token :" + data.token);
          console.log("data :" + data);
        } catch (error) {
          console.error("error :" + error);
        }
      };

    return (
    <>
      <button
        className="btn btn-ghost bg-white text-black hover:bg-gray-200"
        onClick={handleClick}
      >
        42 LOGIN
      </button>
    </>
  );
};

export default ButtonLogin;