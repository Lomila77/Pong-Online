// useAuthGuard.tsx
import React, { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user?.isAuthenticated) {
    console.log("redirect user.ProtectedRoute")
    console.log(user)
    return <Navigate to="/login" replace />;
  }
  return children;
};

// const AuthRedirectRoutes = ({ children }) => {
//   const { user } = useUser();
//   const [redirected, setRedirected] = useState(false);

//   if (user?.isAuthenticated && !redirected) {
//     setRedirected(true);
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

const AuthRedirectRoutes = ({ children }) => {
  const { user } = useUser();

  if (user?.isAuthenticated) {
    console.log("redirect user.AuthRedirectRoutes")
    console.log(user)
    return <Navigate to="/" replace />;
  }
  return children;
};

export { ProtectedRoute, AuthRedirectRoutes };


