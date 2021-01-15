import React from 'react';
import TopBar from './TopBar';
import Footer from './Footer';
import background from '../../assets/background.svg';

const NavigationFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundImage: `url(${background})`,
          backgroundPosition: '50% 50%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <TopBar />
        <div style={{ flexGrow: 1 }}>{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default NavigationFrame;
