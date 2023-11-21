import React, { createContext, useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { backRequest, backResInterface, getUser } from '../api/queries';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const UserContext = createContext<{
  user: backResInterface | null;
  setUser: React.Dispatch<React.SetStateAction<backResInterface | null>>;
  // toggleAuthStatus: (status: boolean) => void; //is a function that takes nothing and returns void
} | null>(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<backResInterface | null>(null);
  // const [authStatus, setAuthStatus] = useState<boolean>(false)

  // const toggleAuthStatus = (status: boolean) => {
  //   setAuthStatus(status)}

  const isAuthenticated = () => {
    const jwtToken = Cookies.get("jwtToken")
    return jwtToken ? true : false;
  }

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['backRequest'],
    queryFn: () => backRequest('users/profil', 'GET'),
    enabled: isAuthenticated(),
  });
  console.log("🚀 ~ file: UserContext.tsx:15 ~ UserProvider ~ userData:", userData/*, authStatus*/)

  useEffect(() => {
    if (
      isAuthenticated() &&
      userData &&
      userData.data &&
      userData.data.pseudo !== user?.pseudo &&
      userData.data.avatar !== user?.avatar
    ) {
      setUser({
        pseudo: userData.data.pseudo,
        avatar: userData.data.avatar,
        isF2Active: userData.data.isF2Active,
      });
    }
  }, [userData, setUser, user, isAuthenticated]);

  return (
    <UserContext.Provider value={{ user, setUser/*, toggleAuthStatus*/ }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
