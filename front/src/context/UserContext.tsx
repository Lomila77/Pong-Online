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
  const queryClient = useQueryClient();
  const [user, setUser] = useState<backResInterface | null>(null);

  //   const isAuthenticated = () => {
  //   const jwtToken = Cookies.get("jwtToken")
  //   return jwtToken ? true : false;
  // }

  //   const { data: userData, status} = useQuery({
  //   queryKey: ["userData"],
  //   queryFn: () => backRequest('users/profil', 'GET'),
  //   enabled: isAuthenticated(),
  // });

  // useEffect(() => {
  //       if ( isAuthenticated() && status === 'success' && userData && userData.data) {
  //         setUser({
  //           pseudo: userData.data.pseudo,
  //           avatar: userData.data.avatar,
  //           isF2Active: userData.data.isF2Active,
  //         });
  //       }
  //     }, [status, userData, isAuthenticated]);

  // useEffect(() => {
  // const fetchData = async () => {
  //   if (isAuthenticated() && status === 'success' && userData && userData.data) {
  //     setUser({
  //       pseudo: userData.data.pseudo,
  //       avatar: userData.data.avatar,
  //       isF2Active: userData.data.isF2Active,
  //     });
  //   }
  // };

  // fetchData();
// }, [status, userData, setUser, isAuthenticated]);

  const mutation = useMutation(
    {
      mutationFn: async ({ fistConnection, params }: { fistConnection: boolean, params?: any }) => {
      console.log("\n\n\n\n firstconection and params : \n", fistConnection, "\n", params)

      const ret =  fistConnection
      ? await backRequest("auth/settingslock", "POST", params)
      : await backRequest("users/update", 'POST', params);
      console.log("ret is giving back : ", ret)
      return ret;
    },
      onSuccess: (newData) => {
        queryClient.invalidateQueries(["userData"]);
        setUser(newData)
      },
    }
  );

  const handleUpdateUser = (fistConnection: boolean, newData) => {
    console.log ("handle updateUser new data value is \n\n\n\n", newData)
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



// import React, { createContext, useState, useContext } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { backRequest, backResInterface, getUser } from '../api/queries';
// import { createUser } from '../api/queries';
// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import Cookies from 'js-cookie';

// const UserContext = createContext<{
//   user: backResInterface | null;
//   setUser: React.Dispatch<React.SetStateAction<backResInterface | null>>;
//   updateUser: (newData: backResInterface | null) => void;
// } | null>(null);

// export const UserProvider = ({ children }) => {
//   const queryClient = useQueryClient();
//   const [user, setUser] = useState<backResInterface | null>(null);

//   const isAuthenticated = () => {
//     const jwtToken = Cookies.get("jwtToken")
//     return jwtToken ? true : false;
//   }

//   const { data: userData, status} = useQuery({
//     queryKey: ["userData"],
//     queryFn: () => backRequest('users/profil', 'GET'),
//     // enabled: isAuthenticated(),
//   });
//   console.log("🚀 ~ file: UserContext.tsx:20 ~ UserProvider ~ userData:", userData)
//   const mutation = useMutation(
//     {
//       // onMutate: variables => { backRequest('users/check', 'GET') }
//       mutationFn: () => backRequest('users/update', 'GET'),
//       onSuccess: (newData) => {
//         queryClient.invalidateQueries(["userData"]);
//         setUser(newData)
//       },
//     }
//   );

//   const handleUpdateUser = (newData : backResInterface | void) => {
//     mutation.mutate(newData);
//   };

//   useEffect(() => {
//     if ( isAuthenticated(), status === 'success' && userData && userData.data) {
//       setUser({
//         pseudo: userData.data.pseudo,
//         avatar: userData.data.avatar,
//         isF2Active: userData.data.isF2Active,
//       });
//     }
//   }, [status, userData, setUser, isAuthenticated]);

//   if (location.pathname !== '/login' && user === null) {
//     return <div>Loading user...</div>;
//   }

//   return (
//     <UserContext.Provider value={{ user, setUser, updateUser: handleUpdateUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };
