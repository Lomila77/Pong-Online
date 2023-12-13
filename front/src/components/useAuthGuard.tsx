// useAuthGuard.tsx
import React, { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user?.isAuthenticated) {
    // console.log("redirect user.ProtectedRoute")
    console.log("rediret home ------> login")
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AuthRedirectRoutes = ({ children }) => {
  const { user } = useUser();

  if (user?.isAuthenticated) {
    console.log("redirect login ------> home")
    return <Navigate to="/" replace />;
  }
  return children;
};


export { ProtectedRoute, AuthRedirectRoutes };




// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, user }) => {
//   if (!user?.isAuthenticated) {
//     console.log("redirect home ------> login");
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// const AuthRedirectRoutes = ({ children, user }) => {
//   if (user?.isAuthenticated) {
//     console.log("redirect login ------> home");
//     return <Navigate to="/" replace />;
//   }
//   return children;
// };

// export { ProtectedRoute, AuthRedirectRoutes };
