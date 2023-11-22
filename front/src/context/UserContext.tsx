import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backRequest, backResInterface, getUser } from '../api/queries';
import Cookies from 'js-cookie';


const UserContext = createContext<{
  user: backResInterface | null;
  setUser: React.Dispatch<React.SetStateAction<backResInterface | null>>;
  updateUser: (fistConnection: boolean, newData: any) => void;
} | null>(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<backResInterface | null>(null);
  const queryClient = useQueryClient();

    /***************************** */
    /* useQuery is for GET request*/
    /***************************** */
    const isAuthenticated = () => {
      const jwtToken = Cookies.get("jwtToken")
     return jwtToken ? true : false;
    }

    const handleQuerySuccess = (updatedData : backResInterface) => {
      setUser(updatedData);
      console.log("🚀 ~ file: UserContext.tsx:41 ~ after user :", user)
    }

    const { data: userData, status} = useQuery({
    queryKey: ["userData"],
    queryFn: () => backRequest('users/profil', 'GET'),
    enabled: isAuthenticated(),
  });

  useEffect(() => {
    if (status === 'success'){
      handleQuerySuccess(userData.data);
    }
  }, [status, userData, isAuthenticated])


      /******************************** */
     /* useMutation is for post request*/
    /******************************** */
  const mutation = useMutation(
    {
      mutationFn: async ({ fistConnection, params }: { fistConnection: boolean, params?: any }) => {
      const ret =  fistConnection
      ? await backRequest("auth/settingslock", "POST", params)
      : await backRequest("users/update", 'POST', params);
      // console.log("ret is giving back : ", ret)
      return ret;
    },
      onSuccess: (newData) => {
        if (newData.isOk) {
          queryClient.invalidateQueries(["userData"]);
          setUser(newData)
        }
      },
    }
  );

  const handleUpdateUser = (fistConnection: boolean, newData) => {
    mutation.mutate({ fistConnection, params: newData });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser: handleUpdateUser }}>
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
