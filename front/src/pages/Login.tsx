import React, { useState } from "react";
// import ModalLogin from "../components/ModalLogin";
import ButtonLogin from "../components/ButtonLogin"
import { useUser } from "../context/UserContext";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

function Login() {
  const navigate = useNavigate();
  const {user} = useUser();
  // const [jwtToken, setJwtToken] = useState(false) ;

  // const updateJwtToken = () => {
  //   setJwtToken(Cookies.get("jwtToken")? true : false);
  // };

  // useEffect(() => {
  //   if (jwtToken) {
  //     console.log("token found : ", jwtToken, "\n\n\n\n")
  //     navigate("/");
  //   }
  // }, [jwtToken])

  useEffect(() => {
    if (user) {
      // console.log("user found, Auto redirection : ", user)
      navigate("/");
    }
  }, [user])

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
