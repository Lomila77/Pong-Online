import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Friends from './pages/Friends'


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
          path="/friends"
          element={
            <Layout>
              <Friends />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App