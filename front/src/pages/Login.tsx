import React, { useState } from "react";
// import ModalLogin from "../components/ModalLogin";
import ButtonLogin from "../components/ButtonLogin"
import { useUser } from "../context/UserContext";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const {user} = useUser();

  // useEffect(() => {
  //   if (user?.isAuthenticated) {
  //     console.log("insige login: user = ", user)
  //     navigate("/");
  //   }
  // }, [user])

  return (
    <div className="Background">
      <div className="loginBtn">
        {/* <ModalLogin/> */}
        <ButtonLogin/>
      </div>
    </div>
  );
}

export default Login;
