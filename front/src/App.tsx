import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Setting from './pages/Setting';
import Leaderboard from './pages/Leaderboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/setting"
          element={
            <Layout>
              <Setting />
            </Layout>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <Layout>
              <Leaderboard />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
