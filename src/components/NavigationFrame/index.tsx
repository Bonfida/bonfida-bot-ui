import React from 'react';
import TopBar from './TopBar';
import Footer from './Footer';

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    overflowY: 'scroll',
    overflowX: 'hidden',
  } as React.CSSProperties,
};

const NavigationFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div style={styles.root}>
        <TopBar />
        <div style={{ flexGrow: 1 }}>{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default NavigationFrame;
