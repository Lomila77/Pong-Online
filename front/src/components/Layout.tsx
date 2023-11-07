import NavBar from './NavBar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div id="mainContainer">
      <NavBar />
      <div id="pageContent">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
