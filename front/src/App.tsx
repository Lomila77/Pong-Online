import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import TwoFA from "./components/TwoFA";
import { AuthRedirectRoutes, ProtectedRoute } from "./components/useAuthGuard";
import Game from './pages/game/Game';
import CreateGame from './pages/game/CreateGame';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* route that should redirect towards "/" us user is authenticated */}
          <Route path="/login" element={ <AuthRedirectRoutes> <Login/> </AuthRedirectRoutes>} />
          <Route path="/twoFA" element={ <AuthRedirectRoutes>  <TwoFA/> </AuthRedirectRoutes>} />
          <Route path="/settingslock" element={<AuthRedirectRoutes> <Settings /> </AuthRedirectRoutes>} />

        {/* route that should redirect towards "/login" us user is not authenticated */}
          <Route path="/" element={ <ProtectedRoute> <Layout> <Home/> </Layout>  </ProtectedRoute>} />
          <Route path="/settings" element={ <ProtectedRoute> <Layout> <Settings /></Layout>  </ProtectedRoute>} />
          <Route path="/leaderboard" element={ <ProtectedRoute> <Layout> <Leaderboard /> </Layout> </ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
