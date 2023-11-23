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
import Game from './pages/game/Game';
import CreateGame from './pages/game/CreateGame';
`
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route
                    path='/'
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />
                <Route
                    path='/settings'
                    element={
                        <Layout>
                            <Settings />
                        </Layout>
                    }
                />
                <Route
                    path='/leaderboard'
                    element={
                        <Layout>
                            <Leaderboard />
                        </Layout>
                    }
                />
                <Route
                    path='/settingslock'
                    element={<Settings />}
                />
                <Route
                    path='/game/create'
                    element={
                        <Layout>
                            <CreateGame/>
                        </Layout>
                    }
                />
                <Route
                    path='/game/:gameId'
                    element={
                        <Layout>
                            <Game />
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
