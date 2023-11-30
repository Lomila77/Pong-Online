import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backRequest, backResInterface} from '../api/queries';
import Cookies from 'js-cookie';
import { ChatProvider } from './ChatContext';


const UserContext = createContext<{
  user: backResInterface | null;
  setUser: React.Dispatch<React.SetStateAction<backResInterface | null>>;
  updateUser: (fistConnection: boolean, newData: any) => void;
  disconnectUser: () => void
} | null>(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<backResInterface | null>(null);
  const queryClient = useQueryClient();

    /***************************** */
    /* useQuery is for GET request*/
    /***************************** */
  const isJwtToken = () => {
    const jwtToken = Cookies.get("jwtToken")
    // console.log("\n looking for coockies\n", jwtToken)
    return jwtToken ? true : false;
  }

  const { data: userData, status} = useQuery({
  queryKey: ["userData"],
  queryFn: () => backRequest('users/profil', 'GET'),
  enabled: isJwtToken(),
  });

  const handleQuerySuccess = (updatedData : backResInterface) => {
    setUser(updatedData);
    console.log("🚀 ~ file: UserContext.tsx:41 ~ afteruser :", user)
  }

  useEffect(() => {
    if (status === 'success'){
      handleQuerySuccess(userData);
    }
    // else if (status === 'error'){}
  }, [status, userData, isJwtToken])

      /******************************** */
     /* useMutation is for post request*/
    /******************************** */
  const mutation = useMutation(
    {
      mutationFn: async ({ fistConnection, params }: { fistConnection: boolean, params?: any }) => {
      const ret =  fistConnection
      ? await backRequest("auth/settingslock", "POST", params)
      : await backRequest("users/update", 'POST', params);
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

  const handleDisconnectUser = () => {
    Cookies.remove("jwtToken");
    setUser((prevUser) => ({...prevUser, isAuthenticated:false}))
    console.log("\n\n\nhandout logout user : ", user);
  }

  useEffect(() => {
    return () => {
      //todo : gerer le demontage
      console.log("UserProvider component is unmounting");
    };
  }, []); // Le tableau de dépendances vide signifie que cela s'exécutera uniquement lors du démontage



  return (
    <UserContext.Provider value={{
    user,
    setUser,
    updateUser: handleUpdateUser,
    disconnectUser: handleDisconnectUser
    }}>
       {/* {status === 'pending' && <p>Loading...</p>} */}
      {/* {children} */}
      <ChatProvider>{children}</ChatProvider>
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
