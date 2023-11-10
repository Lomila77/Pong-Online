import React, { createContext, useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/queries';
import { useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['getUser'],
    queryFn: getUser,
  });

  useEffect(() => {
    if (
      userData &&
      userData.data &&
      userData.data.pseudo !== user?.pseudo &&
      userData.data.avatar !== user?.avatar
    ) {
      setUser({
        pseudo: userData.data.pseudo,
        avatar: userData.data.avatar,
      });
    }
  }, [userData, setUser, user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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