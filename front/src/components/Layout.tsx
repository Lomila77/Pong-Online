import React, { ReactNode } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div id="mainContainer" className="flex flex-col h-full min-h-screen ">
      <NavBar />
      <div id="pageContent" className="h-full py-4 px-4 flex-auto flex justify-center items-center">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
